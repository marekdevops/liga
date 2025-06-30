from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session
from app.models.league import League
from app.schemas.league import LeagueCreate, LeagueRead
from app.models.team import Team
from app.schemas.team import TeamRead
from sqlalchemy.future import select
from fastapi import Path
router = APIRouter(prefix="/league", tags=["LeagueRead"])

@router.post("/", response_model=LeagueRead)
async def create_league(league: LeagueCreate, session: AsyncSession = Depends(get_async_session)):
    db_league = League(**league.dict())
    session.add(db_league)
    await session.commit()
    await session.refresh(db_league)
    return db_league

@router.get("/", response_model=list[LeagueRead])
async def get_LeagueRead(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(League))
    return result.scalars().all()

@router.get("/{league_id}", response_model=LeagueRead)
async def get_league_by_id(
    league_id: int = Path(..., description="ID ligi"),
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(League).where(League.id == league_id))
    league = result.scalar_one_or_none()
    if not league:
        raise HTTPException(status_code=404, detail="Liga nie znaleziona")
    return league

@router.get("/{league_id}/teams", response_model=list[TeamRead])
async def get_teams_for_league(
    league_id: int = Path(..., description="ID ligi"),
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(Team).where(Team.league_id == league_id))
    return result.scalars().all()