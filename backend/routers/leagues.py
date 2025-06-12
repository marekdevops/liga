from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session
from app.models.league import League
from app.schemas.league import LeagueCreate, LeagueRead
from sqlalchemy.future import select

router = APIRouter(prefix="/leagues", tags=["leagues"])

@router.post("/", response_model=LeagueRead)
async def create_league(league: LeagueCreate, session: AsyncSession = Depends(get_async_session)):
    db_league = League(**league.dict())
    session.add(db_league)
    await session.commit()
    await session.refresh(db_league)
    return db_league

@router.get("/", response_model=list[LeagueRead])
async def get_leagues(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(League))
    return result.scalars().all()
