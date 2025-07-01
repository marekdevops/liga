"""
Skrypt do migracji danych - dodanie sezonów i aktualizacja istniejących lig
"""
import sys
import os
from datetime import date

# Dodaj ścieżkę do app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.season import Season
from app.models.league import League

# Używamy synchronicznej bazy danych
DATABASE_URL = "sqlite:///./test.db"

def migrate_add_seasons():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Sprawdź czy kolumna season_id już istnieje w tabeli leagues
        result = db.execute(text("PRAGMA table_info(leagues)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'season_id' not in columns:
            # Dodaj kolumnę season_id do tabeli leagues
            print("Dodaję kolumnę season_id do tabeli leagues...")
            db.execute(text("ALTER TABLE leagues ADD COLUMN season_id INTEGER"))
            db.commit()

        # Sprawdź czy tabela seasons istnieje
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='seasons'"))
        if not result.fetchone():
            # Utwórz tabelę seasons
            print("Tworzę tabelę seasons...")
            db.execute(text("""
                CREATE TABLE seasons (
                    id INTEGER NOT NULL PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    is_current BOOLEAN NOT NULL DEFAULT 0,
                    is_archived BOOLEAN NOT NULL DEFAULT 0
                )
            """))
            db.execute(text("CREATE INDEX ix_seasons_id ON seasons (id)"))
            db.execute(text("CREATE INDEX ix_seasons_name ON seasons (name)"))
            db.commit()

        # Sprawdź czy istnieje aktualny sezon
        current_season = db.query(Season).filter(Season.is_current == True).first()
        
        if not current_season:
            # Utwórz aktualny sezon
            print("Tworzę aktualny sezon...")
            current_season = Season(
                name="Sezon 2024/25",
                start_date=date(2024, 9, 1),
                end_date=date(2025, 6, 30),
                is_current=True,
                is_archived=False
            )
            db.add(current_season)
            db.commit()
            db.refresh(current_season)
            print(f"Utworzono sezon: {current_season.name} (ID: {current_season.id})")

        # Aktualizuj istniejące ligi - powiąż z aktualnym sezonem
        leagues_without_season = db.query(League).filter(League.season_id == None).all()
        if leagues_without_season:
            print(f"Aktualizuję {len(leagues_without_season)} lig - powiązanie z aktualnym sezonem...")
            for league in leagues_without_season:
                league.season_id = current_season.id
            db.commit()
            print("Zaktualizowano ligi")

        # Utwórz przykładowy sezon archiwalny
        archived_season = db.query(Season).filter(Season.name == "Sezon 2023/24").first()
        if not archived_season:
            print("Tworzę przykładowy sezon archiwalny...")
            archived_season = Season(
                name="Sezon 2023/24",
                start_date=date(2023, 9, 1),
                end_date=date(2024, 6, 30),
                is_current=False,
                is_archived=True
            )
            db.add(archived_season)
            db.commit()
            print(f"Utworzono sezon archiwalny: {archived_season.name}")

        print("Migracja zakończona pomyślnie!")
        
    except Exception as e:
        print(f"Błąd podczas migracji: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_add_seasons()
