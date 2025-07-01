from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.season import Season
from ..schemas.season import SeasonCreate, SeasonUpdate

def get_season(db: Session, season_id: int):
    return db.query(Season).filter(Season.id == season_id).first()

def get_seasons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Season).order_by(Season.is_current.desc(), Season.start_date.desc()).offset(skip).limit(limit).all()

def get_current_season(db: Session):
    return db.query(Season).filter(Season.is_current == True).first()

def get_archived_seasons(db: Session):
    return db.query(Season).filter(Season.is_archived == True).order_by(Season.start_date.desc()).all()

def create_season(db: Session, season: SeasonCreate):
    # Jeśli nowy sezon ma być aktualny, ustaw wszystkie inne jako nieaktualne
    if season.is_current:
        db.query(Season).filter(Season.is_current == True).update({"is_current": False})
    
    db_season = Season(**season.dict())
    db.add(db_season)
    db.commit()
    db.refresh(db_season)
    return db_season

def update_season(db: Session, season_id: int, season_update: SeasonUpdate):
    db_season = get_season(db, season_id)
    if not db_season:
        return None
    
    # Jeśli ustawiamy sezon jako aktualny, ustaw wszystkie inne jako nieaktualne
    if season_update.is_current:
        db.query(Season).filter(Season.is_current == True).update({"is_current": False})
    
    update_data = season_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_season, field, value)
    
    db.commit()
    db.refresh(db_season)
    return db_season

def delete_season(db: Session, season_id: int):
    db_season = get_season(db, season_id)
    if db_season:
        db.delete(db_season)
        db.commit()
        return True
    return False

def archive_season(db: Session, season_id: int):
    """Archiwizuje sezon - ustawia is_archived=True i is_current=False"""
    return update_season(db, season_id, SeasonUpdate(is_archived=True, is_current=False))
