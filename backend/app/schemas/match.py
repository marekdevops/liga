from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class MatchBase(BaseModel):
    home_team_id: int
    away_team_id: int
    league_id: int
    match_date: datetime
    round_number: int = Field(..., ge=1, description="Numer kolejki")


class MatchCreate(MatchBase):
    pass


class MatchUpdate(BaseModel):
    home_goals: int = Field(..., ge=0)
    away_goals: int = Field(..., ge=0)


class MatchRead(MatchBase):
    id: int
    home_goals: Optional[int] = None
    away_goals: Optional[int] = None
    is_finished: bool = False
    
    class Config:
        from_attributes = True


class TeamStanding(BaseModel):
    """Pozycja drużyny w tabeli"""
    position: int
    team_id: int
    team_name: str
    matches_played: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int
