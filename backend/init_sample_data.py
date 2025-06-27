import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_async_session, engine, Base
from app.models.league import League
from app.models.team import Team
from app.models.player import Player


async def init_sample_data():
    """Inicjalizuje przykładowe dane jeśli baza jest pusta"""
    
    # Utworz tabele
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Sprawdź czy są już jakieś ligi
    async with AsyncSession(engine) as session:
        from sqlalchemy.future import select
        result = await session.execute(select(League))
        existing_leagues = result.scalars().all()
        
        if existing_leagues:
            print("✅ Baza już zawiera dane. Pomijam inicjalizację.")
            return
        
        print("🔄 Inicjalizuję przykładowe dane...")
        
        # Utwórz przykładową ligę
        league = League(name="Ekstraklasa")
        session.add(league)
        await session.flush()  # Żeby pobrać ID
        
        # Utwórz przykładowe drużyny
        teams_data = [
            "Legia Warszawa",
            "Wisła Kraków", 
            "Lech Poznań",
            "Śląsk Wrocław"
        ]
        
        teams = []
        for team_name in teams_data:
            team = Team(name=team_name, league_id=league.id)
            session.add(team)
            teams.append(team)
        
        await session.flush()  # Żeby pobrać ID drużyn
        
        # Utwórz przykładowych zawodników
        players_data = [
            ("Robert", "Lewandowski", 9),
            ("Wojciech", "Szczęsny", 1),
            ("Piotr", "Zieliński", 10),
            ("Krzysztof", "Piątek", 23),
        ]
        
        for i, (first_name, last_name, shirt_number) in enumerate(players_data):
            player = Player(
                first_name=first_name,
                last_name=last_name,
                shirt_number=shirt_number,
                team_id=teams[i % len(teams)].id
            )
            session.add(player)
        
        await session.commit()
        print("✅ Przykładowe dane zostały dodane!")
        print(f"   - Liga: {league.name}")
        print(f"   - Drużyny: {len(teams_data)}")
        print(f"   - Zawodnicy: {len(players_data)}")


if __name__ == "__main__":
    try:
        asyncio.run(init_sample_data())
    except Exception as e:
        print(f"❌ Błąd podczas inicjalizacji: {e}")
        sys.exit(1)
