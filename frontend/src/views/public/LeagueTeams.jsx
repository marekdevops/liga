import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function LeagueTeams() {
  const { leagueId } = useParams();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch(`/leagues/${leagueId}/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Błąd pobierania drużyn:", err));
  }, [leagueId]);

  return (
    <div>
      <h2>Drużyny w lidze ID: {leagueId}</h2>
      {teams.length === 0 ? (
        <p>Brak drużyn w tej lidze.</p>
      ) : (
        <ul>
          {teams.map((team) => (
            <li key={team.id}>{team.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
