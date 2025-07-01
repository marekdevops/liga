from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..schemas.season import Season, SeasonCreate, SeasonUpdate, SeasonWithLeagues
from ..crud import season as season_crud

router = APIRouter()

@router.get("/", response_model=List[Season])
def get_seasons(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Pobiera wszystkie sezony"""
    return season_crud.get_seasons(db, skip=skip, limit=limit)

@router.get("/current", response_model=Season)
def get_current_season(db: Session = Depends(get_db)):
    """Pobiera aktualny sezon"""
    season = season_crud.get_current_season(db)
    if not season:
        raise HTTPException(status_code=404, detail="Brak aktualnego sezonu")
    return season

@router.get("/archived", response_model=List[Season])
def get_archived_seasons(db: Session = Depends(get_db)):
    """Pobiera archiwalne sezony"""
    return season_crud.get_archived_seasons(db)

@router.get("/{season_id}", response_model=SeasonWithLeagues)
def get_season(season_id: int, db: Session = Depends(get_db)):
    """Pobiera szczegóły sezonu wraz z ligami"""
    season = season_crud.get_season(db, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Sezon nie znaleziony")
    return season

@router.post("/", response_model=Season)
def create_season(season: SeasonCreate, db: Session = Depends(get_db)):
    """Tworzy nowy sezon"""
    return season_crud.create_season(db, season)

@router.put("/{season_id}", response_model=Season)
def update_season(season_id: int, season_update: SeasonUpdate, db: Session = Depends(get_db)):
    """Aktualizuje sezon"""
    season = season_crud.update_season(db, season_id, season_update)
    if not season:
        raise HTTPException(status_code=404, detail="Sezon nie znaleziony")
    return season

@router.post("/{season_id}/archive", response_model=Season)
def archive_season(season_id: int, db: Session = Depends(get_db)):
    """Archiwizuje sezon"""
    season = season_crud.archive_season(db, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Sezon nie znaleziony")
    return season

@router.delete("/{season_id}")
def delete_season(season_id: int, db: Session = Depends(get_db)):
    """Usuwa sezon"""
    success = season_crud.delete_season(db, season_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sezon nie znaleziony")
    return {"message": "Sezon został usunięty"}
