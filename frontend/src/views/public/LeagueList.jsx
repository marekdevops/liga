import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function LeagueList() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    fetch("/leagues/")
      .then((res) => res.json())
      .then((data) => setLeagues(data))
      .catch((err) => console.error("Błąd pobierania lig:", err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dostępne ligi</h1>
      <ul className="space-y-2">
        {leagues.map((league) => (
          <li key={league.id}>
            <Link to={`/league/${league.id}`} className="text-blue-600 underline">
              {league.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LeagueList;
