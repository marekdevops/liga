# backend/routers/teams.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db import get_async_session
from app.models.team import Team
from app.schemas.league import LeagueCreate
from app.models.player import Player
from schemas.player import PlayerRead

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/")
async def get_teams(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Team))
    return result.scalars().all()

@router.post("/")
async def create_league(league: LeagueCreate, session: AsyncSession = Depends(get_async_session)):
    new_league = League(**league.dict())
    session.add(new_league)
    await session.commit()
    await session.refresh(new_league)
    return new_league

@router.get("/{team_id}/players", response_model=list[PlayerRead])
async def get_team_players(team_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Player).where(Player.team_id == team_id))
    players = result.scalars().all()
    return players