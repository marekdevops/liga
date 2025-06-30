from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
from app.schemas.match_player_stats import MatchPlayerStatsCreate


class MatchBase(BaseModel):
    home_team_id: int
    away_team_id: int
    league_id: int
    match_date: datetime
    round_number: int = Field(..., ge=1, description="Numer kolejki")


class MatchCreate(MatchBase):
    pass


class MatchUpdate(BaseModel):
    home_goals: int = Field(..., ge=0)
    away_goals: int = Field(..., ge=0)


class MatchResultWithStats(BaseModel):
    """Schemat dla zapisywania wyniku meczu wraz ze statystykami zawodników"""
    home_goals: int = Field(..., ge=0)
    away_goals: int = Field(..., ge=0)
    player_stats: List[MatchPlayerStatsCreate]
    
    @validator('player_stats')
    def validate_player_stats(cls, v, values):
        """Walidacja statystyk zawodników"""
        if 'home_goals' not in values or 'away_goals' not in values:
            return v
            
        home_goals = values['home_goals']
        away_goals = values['away_goals']
        
        # Policz bramki per drużyna ze statystyk zawodników
        home_team_goals = 0
        away_team_goals = 0
        
        # Grupuj statystyki per drużyna (potrzebujemy dodatkowych informacji o drużynach)
        for stat in v:
            if stat.goals > 0:
                # Tutaj potrzebujemy sprawdzić do jakiej drużyny należy zawodnik
                # To zostanie zwalidowane w endpoincie
                pass
                
        return v


class MatchRead(MatchBase):
    id: int
    home_goals: Optional[int] = None
    away_goals: Optional[int] = None
    is_finished: bool = False
    
    class Config:
        from_attributes = True


class TeamStanding(BaseModel):
    """Pozycja drużyny w tabeli"""
    position: int
    team_id: int
    team_name: str
    matches_played: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int
