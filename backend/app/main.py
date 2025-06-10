# backend/app/main.py

from fastapi import FastAPI
from app.db import engine, Base
from app.models.league import League
from routers import leagues 

app = FastAPI()
app.include_router(leagues.router)

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health")
async def health():
    return {"status": "ok"}
