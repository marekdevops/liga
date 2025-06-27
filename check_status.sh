#!/bin/bash

echo "=== Sprawdzanie stanu aplikacji Liga ==="
echo "Data: $(date)"
echo

echo "1. Status kontenerów Docker:"
docker ps --filter "name=football" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

echo "2. Volume PostgreSQL:"
docker volume inspect liga_postgres_data 2>/dev/null | grep Mountpoint || echo "Volume nie istnieje"
echo

echo "3. Ilość danych w bazie:"
docker exec football_db psql -U user -d football_db -c "
SELECT 
    'Ligi' as tabela, COUNT(*) as ilosc FROM leagues
UNION ALL
SELECT 
    'Drużyny' as tabela, COUNT(*) as ilosc FROM teams  
UNION ALL
SELECT 
    'Zawodnicy' as tabela, COUNT(*) as ilosc FROM players
UNION ALL
SELECT 
    'Mecze' as tabela, COUNT(*) as ilosc FROM matches;
" 2>/dev/null || echo "Nie można połączyć z bazą danych"

echo
echo "4. Ostatnie logi backendu:"
docker logs football_api --tail 10 2>/dev/null || echo "Kontener API nie działa"
