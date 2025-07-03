"""
Skrypt do migracji danych - dodanie tabel użytkowników i utworzenie domyślnego admina
"""
import sys
import os
from datetime import date

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

def migrate_add_users():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Sprawdź czy istnieje domyślny admin
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if not admin_user:
            # Utwórz domyślnego admina
            print("Tworzę domyślnego administratora...")
            admin_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=User.get_password_hash("admin123"),
                is_active=True,
                is_admin=True,
                can_manage_leagues=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print(f"Utworzono administratora: {admin_user.username} (ID: {admin_user.id})")
        else:
            print(f"Administrator już istnieje: {admin_user.username}")

        # Utwórz przykładowego użytkownika z prawami do zarządzania ligami
        manager_user = db.query(User).filter(User.username == "manager").first()
        
        if not manager_user:
            print("Tworzę użytkownika z prawami do zarządzania ligami...")
            manager_user = User(
                username="manager",
                email="manager@example.com",
                hashed_password=User.get_password_hash("manager123"),
                is_active=True,
                is_admin=False,
                can_manage_leagues=True
            )
            db.add(manager_user)
            db.commit()
            db.refresh(manager_user)
            print(f"Utworzono menedżera: {manager_user.username} (ID: {manager_user.id})")
        else:
            print(f"Menedżer już istnieje: {manager_user.username}")

        print("Migracja użytkowników zakończona pomyślnie!")
        
        # Wyświetl podsumowanie
        all_users = db.query(User).all()
        print(f"\nPodsumowanie:")
        print(f"- Liczba użytkowników: {len(all_users)}")
        for user in all_users:
            roles = []
            if user.is_admin:
                roles.append("Admin")
            if user.can_manage_leagues:
                roles.append("Manager lig")
            roles_str = ", ".join(roles) if roles else "Użytkownik"
            print(f"  * {user.username} ({user.email}) - {roles_str}")
        
    except Exception as e:
        print(f"Błąd podczas migracji: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_add_users()
