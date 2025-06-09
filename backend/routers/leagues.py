from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/leagues", tags=["Leagues"])

class League(BaseModel):
    id: int
    name: str
    season: str

# Dummy in-memory store
leagues = []

@router.get("/")
def list_leagues():
    return leagues

@router.post("/")
def create_league(league: League):
    leagues.append(league)
    return league
