# backend/routers/teams.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db import get_async_session
from app.models.team import Team
from app.models.player import Player
from app.models.league import League
from app.schemas.team import TeamCreate, TeamRead
from app.schemas.player import PlayerRead

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/", response_model=list[TeamRead])
async def get_teams(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Team))
    return result.scalars().all()

@router.post("/", response_model=TeamRead)
async def create_team(team: TeamCreate, session: AsyncSession = Depends(get_async_session)):
    # Sprawdź czy liga istnieje
    league = await session.get(League, team.league_id)
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    db_team = Team(name=team.name, league_id=team.league_id)
    session.add(db_team)
    await session.commit()
    await session.refresh(db_team)
    return db_team

@router.get("/{team_id}", response_model=TeamRead)
async def get_team(team_id: int, session: AsyncSession = Depends(get_async_session)):
    team = await session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.get("/{team_id}/players", response_model=list[PlayerRead])
async def get_team_players(team_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Player).where(Player.team_id == team_id))
    return result.scalars().all()
