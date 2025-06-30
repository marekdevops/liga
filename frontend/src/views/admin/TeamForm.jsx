import { useState, useEffect } from "react";

export default function TeamForm() {
  const [leagues, setLeagues] = useState([]);
  const [name, setName] = useState("");
  const [leagueId, setLeagueId] = useState("");

  useEffect(() => {
    fetch("/api/league/")
      .then((res) => res.json())
      .then((data) => setLeagues(data))
      .catch((err) => console.error("Błąd pobierania lig:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTeam = { name, league_id: parseInt(leagueId) };

    fetch("/api/teams/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTeam),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Błąd zapisu drużyny");
        return res.json();
      })
      .then((data) => {
        alert("Drużyna dodana!");
        setName("");
        setLeagueId("");
      })
      .catch((err) => alert("Błąd: " + err.message));
  };

  return (
    <div>
      <h2>Dodaj drużynę</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nazwa drużyny:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Wybierz ligę:</label>
          <select
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            required
          >
            <option value="">-- wybierz --</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Zapisz drużynę</button>
      </form>
    </div>
  );
}
