from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, text
from datetime import datetime, timedelta

from app.db import get_async_session
from app.models.match import Match
from app.models.team import Team
from app.models.league import League
from app.models.player import Player
from app.models.match_player_stats import MatchPlayerStats
from app.schemas.match import MatchCreate, MatchRead, MatchUpdate, TeamStanding, MatchResultWithStats
from app.schemas.match_player_stats import MatchPlayerStatsCreate, MatchPlayerStatsRead, MatchPlayerStatsUpdate

router = APIRouter(prefix="/matches", tags=["matches"])


@router.post("/", response_model=MatchRead)
async def create_match(match: MatchCreate, session: AsyncSession = Depends(get_async_session)):
    """Dodaje nowy mecz do terminarza"""
    
    # Sprawdź czy liga istnieje
    league = await session.get(League, match.league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    # Sprawdź czy drużyny istnieją i należą do tej ligi
    home_team = await session.get(Team, match.home_team_id)
    away_team = await session.get(Team, match.away_team_id)
    
    if not home_team or not away_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    if home_team.league_id != match.league_id or away_team.league_id != match.league_id:
        raise HTTPException(status_code=400, detail="Teams must belong to the same league")
    
    if match.home_team_id == match.away_team_id:
        raise HTTPException(status_code=400, detail="Team cannot play against itself")
    
    db_match = Match(**match.dict())
    session.add(db_match)
    await session.commit()
    await session.refresh(db_match)
    return db_match


@router.get("/league/{league_id}", response_model=list[MatchRead])
async def get_league_matches(league_id: int, session: AsyncSession = Depends(get_async_session)):
    """Pobiera wszystkie mecze w lidze"""
    result = await session.execute(
        select(Match).where(Match.league_id == league_id).order_by(Match.round_number, Match.match_date)
    )
    return result.scalars().all()


@router.put("/{match_id}/result", response_model=MatchRead)
async def update_match_result(match_id: int, result: MatchUpdate, session: AsyncSession = Depends(get_async_session)):
    """Aktualizuje wynik meczu"""
    
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match.home_goals = result.home_goals
    match.away_goals = result.away_goals
    match.is_finished = True
    
    await session.commit()
    await session.refresh(match)
    return match


@router.put("/{match_id}/result-with-stats", response_model=dict)
async def update_match_result_with_stats(
    match_id: int, 
    result_data: MatchResultWithStats, 
    session: AsyncSession = Depends(get_async_session)
):
    """Aktualizuje wynik meczu wraz ze statystykami zawodników z walidacją"""
    
    # Pobierz mecz
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Pobierz zawodników obu drużyn
    home_players_result = await session.execute(
        select(Player).where(Player.team_id == match.home_team_id)
    )
    home_players = {p.id: p for p in home_players_result.scalars().all()}
    
    away_players_result = await session.execute(
        select(Player).where(Player.team_id == match.away_team_id)
    )
    away_players = {p.id: p for p in away_players_result.scalars().all()}
    
    # Policz bramki ze statystyk zawodników per drużyna
    home_team_goals_from_stats = 0
    away_team_goals_from_stats = 0
    total_assists = 0
    
    for stat in result_data.player_stats:
        player_id = stat.player_id
        
        # Sprawdź czy zawodnik istnieje
        if player_id not in home_players and player_id not in away_players:
            raise HTTPException(status_code=400, detail=f"Player {player_id} not found in either team")
        
        # Policz bramki per drużyna
        if player_id in home_players:
            home_team_goals_from_stats += stat.goals
        else:
            away_team_goals_from_stats += stat.goals
        
        total_assists += stat.assists
    
    # Walidacja: bramki ze statystyk muszą się zgadzać z wynikiem meczu
    if home_team_goals_from_stats != result_data.home_goals:
        raise HTTPException(
            status_code=400, 
            detail=f"Home team goals mismatch: result says {result_data.home_goals}, player stats sum to {home_team_goals_from_stats}"
        )
    
    if away_team_goals_from_stats != result_data.away_goals:
        raise HTTPException(
            status_code=400, 
            detail=f"Away team goals mismatch: result says {result_data.away_goals}, player stats sum to {away_team_goals_from_stats}"
        )
    
    # Walidacja: asyst nie może być więcej niż bramek
    total_goals = result_data.home_goals + result_data.away_goals
    if total_assists > total_goals:
        raise HTTPException(
            status_code=400, 
            detail=f"Too many assists ({total_assists}) for total goals ({total_goals})"
        )
    
    # Zaktualizuj wynik meczu
    match.home_goals = result_data.home_goals
    match.away_goals = result_data.away_goals
    match.is_finished = True
    
    # Usuń stare statystyki
    old_stats_result = await session.execute(
        select(MatchPlayerStats).where(MatchPlayerStats.match_id == match_id)
    )
    for old_stat in old_stats_result.scalars().all():
        await session.delete(old_stat)
    
    # Dodaj nowe statystyki
    created_stats = 0
    for stat_data in result_data.player_stats:
        if stat_data.was_present or stat_data.goals > 0 or stat_data.assists > 0:
            stat_data.match_id = match_id  # Upewnij się że match_id jest ustawione
            db_stat = MatchPlayerStats(**stat_data.dict())
            session.add(db_stat)
            created_stats += 1
    
    await session.commit()
    await session.refresh(match)
    
    return {
        "message": "Match result and player stats updated successfully",
        "match_id": match_id,
        "final_score": f"{result_data.home_goals}:{result_data.away_goals}",
        "player_stats_created": created_stats,
        "total_goals": total_goals,
        "total_assists": total_assists
    }


@router.get("/league/{league_id}/table", response_model=list[TeamStanding])
async def get_league_table(league_id: int, session: AsyncSession = Depends(get_async_session)):
    """Generuje tabelę ligową na podstawie wyników meczów"""
    
    # Pobierz wszystkie drużyny w lidze
    teams_result = await session.execute(select(Team).where(Team.league_id == league_id))
    teams = teams_result.scalars().all()
    
    if not teams:
        return []
    
    # Pobierz wszystkie zakończone mecze w lidze
    matches_result = await session.execute(
        select(Match).where(and_(Match.league_id == league_id, Match.is_finished == True))
    )
    matches = matches_result.scalars().all()
    
    # Utwórz statystyki dla każdej drużyny (inicjalizuj z zerami)
    standings = []
    for team in teams:
        stats = {
            "team_id": team.id,
            "team_name": team.name,
            "matches_played": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "goals_for": 0,
            "goals_against": 0,
            "points": 0
        }
        
        # Przejdź przez wszystkie mecze drużyny
        for match in matches:
            if match.home_team_id == team.id:
                # Drużyna grała u siebie
                stats["matches_played"] += 1
                stats["goals_for"] += match.home_goals
                stats["goals_against"] += match.away_goals
                
                if match.home_goals > match.away_goals:
                    stats["wins"] += 1
                    stats["points"] += 3
                elif match.home_goals == match.away_goals:
                    stats["draws"] += 1
                    stats["points"] += 1
                else:
                    stats["losses"] += 1
                    
            elif match.away_team_id == team.id:
                # Drużyna grała na wyjeździe
                stats["matches_played"] += 1
                stats["goals_for"] += match.away_goals
                stats["goals_against"] += match.home_goals
                
                if match.away_goals > match.home_goals:
                    stats["wins"] += 1
                    stats["points"] += 3
                elif match.away_goals == match.home_goals:
                    stats["draws"] += 1
                    stats["points"] += 1
                else:
                    stats["losses"] += 1
        
        stats["goal_difference"] = stats["goals_for"] - stats["goals_against"]
        stats["position"] = 0  # Tymczasowa pozycja
        standings.append(TeamStanding(**stats))
    
    # Sortuj tabelę według punktów, różnicy bramek, bramek zdobytych
    standings.sort(key=lambda x: (-x.points, -x.goal_difference, -x.goals_for))
    
    # Dodaj pozycje
    for i, standing in enumerate(standings, 1):
        standing.position = i
    
    return standings


@router.delete("/league/{league_id}/clear-schedule")
async def clear_league_schedule(league_id: int, session: AsyncSession = Depends(get_async_session)):
    """Usuwa wszystkie mecze z ligi (do testowania)"""
    
    # Sprawdź czy liga istnieje
    league = await session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    # Usuń wszystkie mecze z ligi
    result = await session.execute(select(Match).where(Match.league_id == league_id))
    matches = result.scalars().all()
    
    for match in matches:
        await session.delete(match)
    
    await session.commit()
    
    return {
        "message": f"Usunięto {len(matches)} meczów z ligi {league.name}",
        "deleted_matches": len(matches)
    }


@router.post("/league/{league_id}/generate-schedule")
async def generate_league_schedule(league_id: int, session: AsyncSession = Depends(get_async_session)):
    """Generuje kompletny terminarz dla ligi - każdy z każdym x2 (mecz i rewanż)"""
    
    # Sprawdź czy liga istnieje
    league = await session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    # Pobierz wszystkie drużyny w lidze
    teams_result = await session.execute(select(Team).where(Team.league_id == league_id))
    teams = teams_result.scalars().all()
    
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="Liga musi mieć co najmniej 2 drużyny")
    
    # Sprawdź czy już są jakieś mecze w lidze
    existing_matches = await session.execute(select(Match).where(Match.league_id == league_id))
    if existing_matches.scalars().first():
        raise HTTPException(status_code=400, detail="Liga ma już utworzony terminarz")
    
    teams_list = list(teams)
    n_teams = len(teams_list)
    
    # Jeśli nieparzysta liczba drużyn, dodaj "bye" (fantom)
    if n_teams % 2 == 1:
        teams_list.append(None)  # Fantom drużyna
        n_teams += 1
    
    matches_to_create = []
    
    # Algorytm round-robin - każdy z każdym (poprawiony)
    def generate_round_robin(teams, is_return=False):
        n = len(teams)
        rounds = []
        
        # Kopia listy drużyn do rotacji
        teams_copy = teams[:]
        
        for round_num in range(n - 1):
            round_matches = []
            
            # W każdej kolejce każda drużyna gra jeden mecz
            for i in range(n // 2):
                home_idx = i
                away_idx = n - 1 - i
                
                home_team = teams_copy[home_idx]
                away_team = teams_copy[away_idx]
                
                # Pomiń mecze z fantomem
                if home_team is None or away_team is None:
                    continue
                
                # W rewanżach odwróć gospodarzy
                if is_return:
                    home_team, away_team = away_team, home_team
                
                round_matches.append((home_team, away_team))
            
            if round_matches:  # Dodaj tylko niepuste kolejki
                rounds.append(round_matches)
            
            # Rotacja drużyn (pierwszy zostaje na miejscu, reszta rotuje)
            teams_copy = [teams_copy[0]] + [teams_copy[-1]] + teams_copy[1:-1]
        
        return rounds
    
    # Generuj pierwszą rundę (każdy z każdym)
    first_round_schedule = generate_round_robin(teams_list[:])
    
    # Generuj drugą rundę (rewanże)
    second_round_schedule = generate_round_robin(teams_list[:], True)
    
    # Kombinuj obie rundy
    all_rounds = first_round_schedule + second_round_schedule
    
    # Utwórz mecze z prawidłowymi datami
    base_date = datetime.now().replace(hour=19, minute=0, second=0, microsecond=0)
    
    round_counter = 1
    
    for round_idx, round_matches in enumerate(all_rounds):
        # Data kolejki (co tydzień)
        round_date = base_date + timedelta(weeks=round_idx)
        
        for match_idx, (home_team, away_team) in enumerate(round_matches):
            # Czas meczu (co godzinę w ramach kolejki: 19:00, 20:00, 21:00...)
            match_time = round_date + timedelta(hours=match_idx)
            
            match_data = {
                "home_team_id": home_team.id,
                "away_team_id": away_team.id,
                "league_id": league_id,
                "match_date": match_time,
                "round_number": round_counter,
                "is_finished": False
            }
            matches_to_create.append(Match(**match_data))
        
        # Zwiększ numer kolejki tylko jeśli były mecze w tej kolejce
        if round_matches:
            round_counter += 1
    
    # Zapisz wszystkie mecze
    for match in matches_to_create:
        session.add(match)
    
    await session.commit()
    
    return {
        "message": f"Utworzono terminarz dla ligi {league.name}",
        "total_matches": len(matches_to_create),
        "total_rounds": round_counter - 1
    }


@router.get("/{match_id}", response_model=MatchRead)
async def get_match(match_id: int, session: AsyncSession = Depends(get_async_session)):
    """Pobiera szczegóły pojedynczego meczu"""
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.get("/{match_id}/players", response_model=dict)
async def get_match_players(match_id: int, session: AsyncSession = Depends(get_async_session)):
    """Pobiera wszystkich zawodników drużyn grających w danym meczu wraz z ich statystykami"""
    
    # Pobierz mecz
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Pobierz zawodników drużyny gospodarzy
    home_players_result = await session.execute(
        select(Player).where(Player.team_id == match.home_team_id)
    )
    home_players = home_players_result.scalars().all()
    
    # Pobierz zawodników drużyny gości
    away_players_result = await session.execute(
        select(Player).where(Player.team_id == match.away_team_id)
    )
    away_players = away_players_result.scalars().all()
    
    # Pobierz istniejące statystyki dla tego meczu
    stats_result = await session.execute(
        select(MatchPlayerStats).where(MatchPlayerStats.match_id == match_id)
    )
    existing_stats = {stat.player_id: stat for stat in stats_result.scalars().all()}
    
    # Przygotuj dane dla frontendu
    home_team_data = []
    for player in home_players:
        stats = existing_stats.get(player.id)
        player_data = {
            "id": player.id,
            "first_name": player.first_name,
            "last_name": player.last_name,
            "shirt_number": player.shirt_number,
            "was_present": stats.was_present if stats else False,
            "goals": stats.goals if stats else 0,
            "assists": stats.assists if stats else 0,
            "goal_minute": stats.goal_minute if stats else ""
        }
        home_team_data.append(player_data)
    
    away_team_data = []
    for player in away_players:
        stats = existing_stats.get(player.id)
        player_data = {
            "id": player.id,
            "first_name": player.first_name,
            "last_name": player.last_name,
            "shirt_number": player.shirt_number,
            "was_present": stats.was_present if stats else False,
            "goals": stats.goals if stats else 0,
            "assists": stats.assists if stats else 0,
            "goal_minute": stats.goal_minute if stats else ""
        }
        away_team_data.append(player_data)
    
    return {
        "home_team": {
            "id": match.home_team_id,
            "players": sorted(home_team_data, key=lambda x: x["shirt_number"])
        },
        "away_team": {
            "id": match.away_team_id,
            "players": sorted(away_team_data, key=lambda x: x["shirt_number"])
        }
    }


@router.put("/{match_id}/player-stats", response_model=dict)
async def update_match_player_stats(
    match_id: int, 
    player_stats: list[MatchPlayerStatsCreate], 
    session: AsyncSession = Depends(get_async_session)
):
    """Aktualizuje statystyki wszystkich zawodników dla danego meczu"""
    
    # Sprawdź czy mecz istnieje
    match = await session.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Usuń istniejące statystyki dla tego meczu
    await session.execute(
        select(MatchPlayerStats).where(MatchPlayerStats.match_id == match_id)
    )
    existing_stats = await session.execute(
        select(MatchPlayerStats).where(MatchPlayerStats.match_id == match_id)
    )
    for stat in existing_stats.scalars().all():
        await session.delete(stat)
    
    # Dodaj nowe statystyki
    created_stats = []
    for stat_data in player_stats:
        if stat_data.match_id != match_id:
            raise HTTPException(status_code=400, detail="Match ID mismatch")
        
        # Sprawdź czy zawodnik istnieje
        player = await session.get(Player, stat_data.player_id)
        if not player:
            raise HTTPException(status_code=404, detail=f"Player {stat_data.player_id} not found")
        
        # Tylko dodaj statystyki jeśli zawodnik był obecny lub ma jakieś statystyki
        if stat_data.was_present or stat_data.goals > 0 or stat_data.assists > 0:
            db_stat = MatchPlayerStats(**stat_data.dict())
            session.add(db_stat)
            created_stats.append(stat_data)
    
    await session.commit()
    
    return {
        "message": f"Zaktualizowano statystyki dla {len(created_stats)} zawodników",
        "match_id": match_id,
        "updated_players": len(created_stats)
    }


@router.get("/league/{league_id}/top-players", response_model=dict)
async def get_league_top_players(league_id: int, session: AsyncSession = Depends(get_async_session)):
    """Pobiera top strzelców i asystentów dla danej ligi"""
    
    # Sprawdź czy liga istnieje
    league = await session.get(League, league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    # Zapytanie o top strzelców
    top_scorers_query = """
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.shirt_number,
        t.name as team_name,
        SUM(mps.goals) as total_goals
    FROM players p
    JOIN teams t ON p.team_id = t.id
    JOIN match_player_stats mps ON p.id = mps.player_id
    JOIN matches m ON mps.match_id = m.id
    WHERE t.league_id = :league_id AND mps.goals > 0
    GROUP BY p.id, p.first_name, p.last_name, p.shirt_number, t.name
    ORDER BY total_goals DESC, p.last_name
    LIMIT 5
    """
    
    # Zapytanie o top asystentów
    top_assists_query = """
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.shirt_number,
        t.name as team_name,
        SUM(mps.assists) as total_assists
    FROM players p
    JOIN teams t ON p.team_id = t.id
    JOIN match_player_stats mps ON p.id = mps.player_id
    JOIN matches m ON mps.match_id = m.id
    WHERE t.league_id = :league_id AND mps.assists > 0
    GROUP BY p.id, p.first_name, p.last_name, p.shirt_number, t.name
    ORDER BY total_assists DESC, p.last_name
    LIMIT 5
    """
    
    # Wykonaj zapytania
    top_scorers_result = await session.execute(
        text(top_scorers_query),
        {"league_id": league_id}
    )
    
    top_assists_result = await session.execute(
        text(top_assists_query),
        {"league_id": league_id}
    )
    
    # Przygotuj dane
    top_scorers = []
    for row in top_scorers_result:
        top_scorers.append({
            "id": row.id,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "shirt_number": row.shirt_number,
            "team_name": row.team_name,
            "total_goals": row.total_goals
        })
    
    top_assists = []
    for row in top_assists_result:
        top_assists.append({
            "id": row.id,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "shirt_number": row.shirt_number,
            "team_name": row.team_name,
            "total_assists": row.total_assists
        })
    
    return {
        "league_id": league_id,
        "top_scorers": top_scorers,
        "top_assists": top_assists
    }
