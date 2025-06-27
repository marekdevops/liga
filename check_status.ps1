# Skrypt do sprawdzania stanu aplikacji Liga
Write-Host "=== Sprawdzanie stanu aplikacji Liga ===" -ForegroundColor Green
Write-Host "Data: $(Get-Date)" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Status kontenerów Docker:" -ForegroundColor Cyan
try {
    docker ps --filter "name=football" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
} catch {
    Write-Host "Błąd: Docker nie działa lub kontenery nie są uruchomione" -ForegroundColor Red
}
Write-Host ""

Write-Host "2. Sprawdzanie volume PostgreSQL:" -ForegroundColor Cyan
try {
    docker volume inspect liga_postgres_data
} catch {
    Write-Host "Volume postgres nie istnieje" -ForegroundColor Red
}
Write-Host ""

Write-Host "3. Ilość danych w bazie:" -ForegroundColor Cyan
try {
    $query = @"
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
"@
    docker exec football_db psql -U user -d football_db -c $query
} catch {
    Write-Host "Nie można połączyć z bazą danych" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Ostatnie logi backendu:" -ForegroundColor Cyan
try {
    docker logs football_api --tail 10
} catch {
    Write-Host "Kontener API nie działa" -ForegroundColor Red
}
