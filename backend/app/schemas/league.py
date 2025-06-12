from pydantic import BaseModel

class LeagueBase(BaseModel):
    name: str

class LeagueCreate(LeagueBase):
    pass

class LeagueRead(LeagueBase):
    id: int

    class Config:
        from_attributes = True
