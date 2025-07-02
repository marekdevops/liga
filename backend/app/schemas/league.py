from pydantic import BaseModel
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .season import Season

class LeagueCreate(BaseModel):
    name: str
    season_id: int

class LeagueUpdate(BaseModel):
    name: Optional[str] = None
    season_id: Optional[int] = None

class LeagueRead(BaseModel):
    id: int
    name: str
    season_id: int

    class Config:
        from_attributes = True

class LeagueWithSeason(LeagueRead):
    season: Optional["Season"] = None
    
    class Config:
        from_attributes = True
