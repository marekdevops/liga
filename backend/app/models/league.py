from sqlalchemy import Column, Integer, String, ForeignKey
from app.db import Base
from sqlalchemy.orm import relationship

class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=False)
    
    # Relacje
    season = relationship("Season", back_populates="leagues")
    teams = relationship("Team", back_populates="league", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="league", cascade="all, delete-orphan")
