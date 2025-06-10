# backend/app/models/league.py

from sqlalchemy import Column, Integer, String
from ..db import Base

class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    season = Column(String, nullable=False)
