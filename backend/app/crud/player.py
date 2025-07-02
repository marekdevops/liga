from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from app.models.player import Player
from app.schemas.player import PlayerCreate


async def create_player(session: AsyncSession, player_in: PlayerCreate) -> Player:
    player = Player(**player_in.model_dump())
    session.add(player)
    await session.commit()
    await session.refresh(player)
    return player


async def get_players_by_team(session: AsyncSession, team_id: int) -> list[Player]:
    result = await session.execute(
        select(Player).options(joinedload(Player.team)).where(Player.team_id == team_id)
    )
    return result.scalars().all()


async def get_player(session: AsyncSession, player_id: int) -> Player | None:
    result = await session.execute(
        select(Player).where(Player.id == player_id)
    )
    return result.scalar_one_or_none()


async def delete_player(session: AsyncSession, player_id: int) -> bool:
    player = await get_player(session, player_id)
    if player:
        await session.delete(player)
        await session.commit()
        return True
    return False
