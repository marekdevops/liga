from sqlalchemy.orm import relationship
from app.models.player import Player  # Dodaj ten import u góry

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    league_id = Column(Integer, ForeignKey("leagues.id"))

    league = relationship("League", back_populates="teams")
    players = relationship("Player", back_populates="team", cascade="all, delete-orphan")