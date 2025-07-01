# backend/app/main.py

from fastapi import FastAPI
from app.db import engine, Base
from app.models.league import League
from app.models.team import Team
from app.models.match import Match
from app.models.match_player_stats import MatchPlayerStats
from app.models.season import Season
from routers import leagues
from routers import teams
from routers import players
from routers import matches
from routers import seasons
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.exc import OperationalError
import asyncio

#Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(leagues.router)
app.include_router(teams.router)
app.include_router(players.router)
app.include_router(matches.router)
app.include_router(seasons.router, prefix="/seasons", tags=["seasons"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Można zawęzić np. ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.on_event("startup")
async def on_startup():
    for attempt in range(10):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("✅ Połączenie z bazą danych OK")
            break
        except OperationalError as e:
            print(f"⏳ Próba {attempt + 1}/10: Baza danych niedostępna. Czekam 3s...")
            await asyncio.sleep(3)
    else:
        print("❌ Nie udało się połączyć z bazą po 10 próbach.")
        raise RuntimeError("Baza danych nieosiągalna")


@app.get("/health")
async def health():
    return {"status": "ok"}



