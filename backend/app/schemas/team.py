from pydantic import BaseModel

class TeamCreate(BaseModel):
    name: str
    league_id: int

class TeamRead(TeamCreate):
    id: int

    class Config:
        from_attributes = True
