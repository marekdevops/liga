# backend/app/db.py

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()
#DATABASE_URL = "postgresql+asyncpg://user:password@db:5432/football_db"
DATABASE_URL = "postgresql+asyncpg://user:password@football_db:5432/football_db"
engine = create_async_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

# Dependency
async def get_async_session():
    async with SessionLocal() as session:
        yield session

