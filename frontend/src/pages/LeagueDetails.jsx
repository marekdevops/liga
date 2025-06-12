// src/pages/LeagueDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function LeagueDetails() {
  const { id } = useParams();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch(`/leagues/${id}/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Błąd pobierania drużyn:", err));
  }, [id]);

  return (
    <div>
      <h2>Drużyny w lidze</h2>
      <ul>
        {teams.map((team) => (
          <li key={team.id}>
            <Link to={`/team/${team.id}`}>{team.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LeagueDetails;
