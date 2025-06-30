// src/pages/TeamDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TopBar from "../components/TopBar";

function TeamDetails() {
  const { id } = useParams();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch(`/api/teams/${id}/players`)
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error("Błąd pobierania zawodników:", err));
  }, [id]);

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#1a1a1a", 
      color: "#ffffff", 
      minHeight: "100vh",
      paddingTop: "90px" // miejsce na TopBar
    }}>
      <TopBar />
      <h2 style={{ color: "#4CAF50", marginBottom: "20px" }}>
        Zawodnicy w drużynie
      </h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {players.map((player) => (
          <li 
            key={player.id}
            style={{
              marginBottom: "12px",
              padding: "12px 16px",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "6px",
              color: "#ffffff",
              fontSize: "16px"
            }}
          >
            👤 {player.first_name} {player.last_name} (#{player.shirt_number})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeamDetails;
