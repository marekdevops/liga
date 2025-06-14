// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    fetch("/league/")
      .then((res) => res.json())
      .then((data) => setLeagues(data))
      .catch((err) => console.error("Błąd pobierania lig:", err));
  }, []);

  return (
    <div>
      <h1>Lista Lig</h1>
      <ul>
        {leagues.map((league) => (
          <li key={league.id}>
            <Link to={`/league/${league.id}`}>{league.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
