from pydantic import BaseModel
from typing import Optional


class MatchPlayerStatsCreate(BaseModel):
    match_id: int
    player_id: int
    was_present: bool = False
    goals: int = 0
    assists: int = 0
    goal_minute: Optional[str] = None


class MatchPlayerStatsRead(MatchPlayerStatsCreate):
    id: int

    class Config:
        from_attributes = True


class MatchPlayerStatsUpdate(BaseModel):
    was_present: Optional[bool] = None
    goals: Optional[int] = None
    assists: Optional[int] = None
    goal_minute: Optional[str] = None
