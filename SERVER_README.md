# Liga - System Zarządzania Ligą Piłkarską

## 🚀 Uruchomienie na serwerze

### Pierwszego uruchomienia:
```bash
# 1. Sklonuj repozytorium
git clone <url_repo>
cd liga

# 2. Utwórz foldery dla danych
mkdir -p postgres_data postgres_backup

# 3. Uruchom aplikację
docker-compose up -d --build

# 4. Sprawdź status
./check_status.sh
# lub na Windows:
# .\check_status.ps1

# 5. W razie błędów połączenia, zrestartuj API
docker restart football_api

# 6. Inicjalizuj przykładowe dane (opcjonalnie)
docker exec football_api python init_sample_data.py
```

### Codzienne sprawdzanie:
```bash
# Sprawdź status aplikacji
./check_status.sh

# Restart w razie problemów
docker-compose restart

# Backup bazy danych
docker exec football_db pg_dump -U user football_db > postgres_backup/backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔧 Rozwiązywanie problemów

### Problem: Dane znikają po restarcie
```bash
# 1. Sprawdź czy volume istnieje
docker volume ls | grep postgres

# 2. Sprawdź lokalizację danych
ls -la postgres_data/

# 3. Sprawdź logi
docker logs football_db
docker logs football_api
```

### Problem: Aplikacja nie działa
```bash
# 1. Sprawdź status kontenerów
docker ps

# 2. Restart aplikacji
docker-compose down
docker-compose up -d --build

# 3. Sprawdź logi
docker-compose logs
```

## 📊 Endpointy API

- `GET /league/` - Lista lig
- `GET /matches/league/{id}/table` - Tabela ligowa
- `GET /matches/league/{id}` - Terminarz ligi
- `POST /matches/league/{id}/generate-schedule` - Generuj terminarz
- `PUT /matches/{id}/result` - Dodaj wynik meczu

## 🗃️ Struktura bazy danych

- **leagues** - Ligi
- **teams** - Drużyny 
- **players** - Zawodnicy
- **matches** - Mecze i wyniki

## 📝 Logi i monitoring

```bash
# Logi backendu
docker logs football_api -f

# Logi bazy danych  
docker logs football_db -f

# Status wszystkich serwisów
docker-compose ps
```
