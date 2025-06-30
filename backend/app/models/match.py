from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.db import Base
from datetime import datetime


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    league_id = Column(Integer, ForeignKey("leagues.id"), nullable=False)
    match_date = Column(DateTime, nullable=False)
    round_number = Column(Integer, nullable=False)  # kolejka
    
    # Wyniki meczu (None jeśli mecz się jeszcze nie odbył)
    home_goals = Column(Integer, nullable=True)
    away_goals = Column(Integer, nullable=True)
    is_finished = Column(Boolean, default=False)
    
    # Relacje
    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")
    league = relationship("League", back_populates="matches")
    player_stats = relationship("MatchPlayerStats", back_populates="match", cascade="all, delete-orphan")
