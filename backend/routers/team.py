# backend/routers/teams.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db import get_async_session
from app.models.team import Team

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/")
async def get_teams(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Team))
    return result.scalars().all()
