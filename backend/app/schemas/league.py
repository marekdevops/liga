from pydantic import BaseModel
from typing import Optional

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

# Import na końcu żeby uniknąć circular imports  
from .season import Season
LeagueWithSeason.model_rebuild()
