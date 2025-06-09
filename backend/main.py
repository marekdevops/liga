from fastapi import FastAPI
from routers import leagues

app = FastAPI(title="Football League API")

app.include_router(leagues.router)
