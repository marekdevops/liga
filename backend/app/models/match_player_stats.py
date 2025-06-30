from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db import Base


class MatchPlayerStats(Base):
    __tablename__ = "match_player_stats"

    id = Column(Integer, primary_key=True, index=True)
    
    # Powiązania
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    
    # Obecność na meczu
    was_present = Column(Boolean, default=False)
    
    # Statystyki meczowe
    goals = Column(Integer, default=0)
    assists = Column(Integer, default=0)
    goal_minute = Column(String, nullable=True)  # Minuty bramek, np. "45, 78"
    
    # Relacje
    match = relationship("Match", back_populates="player_stats")
    player = relationship("Player", back_populates="match_stats")
