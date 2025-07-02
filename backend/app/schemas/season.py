from pydantic import BaseModel
from datetime import date
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .league import LeagueRead

class SeasonBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_current: bool = False
    is_archived: bool = False

class SeasonCreate(SeasonBase):
    pass

class SeasonUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    is_archived: Optional[bool] = None

class Season(SeasonBase):
    id: int
    
    class Config:
        from_attributes = True

class SeasonWithLeagues(Season):
    leagues: List["LeagueRead"] = []
    
    class Config:
        from_attributes = True
