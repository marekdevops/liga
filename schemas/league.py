from pydantic import BaseModel

class LeagueCreate(BaseModel):
    name: str
    country: str

class LeagueOut(LeagueCreate):
    id: int

    class Config:
        orm_mode = True
