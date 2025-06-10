from sqlalchemy import Column, Integer, String
from app.db import Base
from sqlalchemy.orm import relationship

class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    country = Column(String)
    teams = relationship("Team", back_populates="league", cascade="all, delete-orphan")
