from sqlalchemy.orm import relationship
from app.models.player import Player  # Dodaj ten import u góry
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    league_id = Column(Integer, ForeignKey("leagues.id"))

    league = relationship("League", back_populates="teams")
    players = relationship("Player", back_populates="team", cascade="all, delete-orphan")
    
    # Relacje do meczów
    home_matches = relationship("Match", foreign_keys="Match.home_team_id", back_populates="home_team")
    away_matches = relationship("Match", foreign_keys="Match.away_team_id", back_populates="away_team")