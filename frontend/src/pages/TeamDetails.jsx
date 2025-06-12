// src/pages/TeamDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function TeamDetails() {
  const { id } = useParams();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch(`/teams/${id}/players`)
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error("Błąd pobierania zawodników:", err));
  }, [id]);

  return (
    <div>
      <h2>Zawodnicy w drużynie</h2>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.first_name} {player.last_name} (#{player.jersey_number})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeamDetails;
