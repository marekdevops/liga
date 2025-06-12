from pydantic import BaseModel, Field


class PlayerBase(BaseModel):
    first_name: str = Field(..., example="Robert")
    last_name: str = Field(..., example="Lewandowski")
    shirt_number: int = Field(..., ge=1, le=99, example=9)


class PlayerCreate(PlayerBase):
    team_id: int


class PlayerRead(PlayerBase):
    id: int
    team_id: int

    class Config:
        from_attributes = True
