# backend/app/db.py

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy import Column, Integer, String, ForeignKey, create_engine
from sqlalchemy.orm import relationship

Base = declarative_base()
#DATABASE_URL = "postgresql+asyncpg://user:password@db:5432/football_db"
DATABASE_URL = "postgresql+asyncpg://user:password@football_db:5432/football_db"
SYNC_DATABASE_URL = "postgresql://user:password@football_db:5432/football_db"

# Async engine i session
engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

# Sync engine i session dla niektórych operacji
sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

# Dependencies
async def get_async_session():
    async with SessionLocal() as session:
        yield session

def get_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

