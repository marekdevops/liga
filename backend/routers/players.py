from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db import get_async_session
from app.models.team import Team
from app.models.player import Player
from schemas.player import PlayerCreate, PlayerRead

router = APIRouter(
    prefix="/players",
    tags=["players"]
)


@router.post("/", response_model=PlayerRead)
async def create_player(
    player: PlayerCreate,
    session: AsyncSession = Depends(get_async_session)
):
    team = await session.get(Team, player.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    db_player = Player(
        first_name=player.first_name,
        last_name=player.last_name,
        shirt_number=player.shirt_number,
        team_id=player.team_id
    )
    session.add(db_player)
    await session.commit()
    await session.refresh(db_player)
    return db_player


@router.get("/", response_model=list[PlayerRead])
async def read_players(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Player))
    players = result.scalars().all()
    return players
