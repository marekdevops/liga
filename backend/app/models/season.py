from sqlalchemy import Column, Integer, String, Boolean, Date
from sqlalchemy.orm import relationship
from ..db import Base

class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)  # np. "Sezon 2024/25"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_current = Column(Boolean, default=False, nullable=False)  # tylko jeden sezon może być aktualny
    is_archived = Column(Boolean, default=False, nullable=False)
    
    # Relacje
    leagues = relationship("League", back_populates="season")
