import { useEffect, useState } from "react";

function App() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    fetch("/leagues/")     
      .then((res) => res.json())
      .then((data) => setLeagues(data))
      .catch((err) => console.error("Błąd pobierania danych:", err));
  }, []);

  return (
    <div>
      <h1>Lista lig</h1>
      <ul>
        {leagues.map((league) => (
          <li key={league.id}>
            {league.name} - {league.country}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;
