import { useEffect, useState } from "react";

export default function LeagueList() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    fetch("/leagues/")
      .then((res) => res.json())
      .then((data) => {
        console.log("ODEBRANE LIGI:", data); // 👈 sprawdz w konsoli
        setLeagues(data);
      })
      .catch((err) => console.error("Błąd pobierania lig:", err));
  }, []);

  return (
    <div>
      <h2>Dostępne ligi</h2>
      {leagues.length === 0 && <p>Brak lig do wyświetlenia.</p>}
      <ul>
        {leagues.map((league) => (
          <li key={league.id}>
            {league.name} ({league.country})
          </li>
        ))}
      </ul>
    </div>
  );
}
