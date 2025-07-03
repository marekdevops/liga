"""
Skrypt do naprawy emaili użytkowników
"""
import sys
import os

# Dodaj ścieżkę do app
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Importuj wszystkie modele aby upewnić się że relacje są poprawnie skonfigurowane
from app.models.user import User
from app.models.season import Season
from app.models.league import League
from app.models.team import Team
from app.models.match import Match
from app.models.match_player_stats import MatchPlayerStats

# Używamy PostgreSQL z Docker
DATABASE_URL = "postgresql://user:password@football_db:5432/football_db"

def fix_user_emails():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Napraw email admina
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            admin_user.email = "admin@example.com"
            print(f"Zaktualizowano email admina: {admin_user.email}")

        # Napraw email menedżera
        manager_user = db.query(User).filter(User.username == "manager").first()
        if manager_user:
            manager_user.email = "manager@example.com"
            print(f"Zaktualizowano email menedżera: {manager_user.email}")

        db.commit()
        print("Emaile zostały naprawione!")
        
    except Exception as e:
        print(f"Błąd: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_emails()
