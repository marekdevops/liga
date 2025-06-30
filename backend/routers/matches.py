from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from datetime import datetime, timedelta

from app.db import get_async_session
from app.models.match import Match
from app.models.team import Team
from app.models.league import League
from app.schemas.match import MatchCreate, MatchRead, MatchUpdate, TeamStanding

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
