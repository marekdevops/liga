from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    shirt_number = Column(Integer, nullable=False)

    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    team = relationship("Team", back_populates="players")
    match_stats = relationship("MatchPlayerStats", back_populates="player", cascade="all, delete-orphan")
