from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_

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
    
    # Pobierz wszystkie zakończone mecze w lidze
    matches_result = await session.execute(
        select(Match).where(and_(Match.league_id == league_id, Match.is_finished == True))
    )
    matches = matches_result.scalars().all()
    
    # Utwórz statystyki dla każdej drużyny
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
        standings.append(TeamStanding(**stats))
    
    # Sortuj tabelę według punktów, różnicy bramek, bramek zdobytych
    standings.sort(key=lambda x: (-x.points, -x.goal_difference, -x.goals_for))
    
    # Dodaj pozycje
    for i, standing in enumerate(standings, 1):
        standing.position = i
    
    return standings
