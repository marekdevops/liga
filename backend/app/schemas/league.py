from pydantic import BaseModel

class LeagueCreate(BaseModel):
    name: str

class LeagueRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True  # jeśli używasz Pydantic v2
