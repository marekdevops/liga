import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TopBar from "../../components/TopBar";

export default function LeagueTeams() {
  const { leagueId } = useParams();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch(`/api/league/${leagueId}/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Błąd pobierania drużyn:", err));
  }, [leagueId]);

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
        Drużyny w lidze ID: {leagueId}
      </h2>
      {teams.length === 0 ? (
        <p style={{ color: "#cccccc", fontSize: "16px" }}>Brak drużyn w tej lidze.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {teams.map((team) => (
            <li 
              key={team.id} 
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
              🏆 {team.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
