import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function LeagueDetails() {
  const { leagueId } = useParams();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/matches/league/${leagueId}/table`)
      .then((res) => res.json())
      .then((data) => {
        setStandings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania tabeli:", err);
        setLoading(false);
      });
  }, [leagueId]);

  if (loading) {
    return <div>Ładowanie tabeli...</div>;
  }

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#1e1e1e", 
      minHeight: "100vh",
      color: "#e0e0e0"
    }}>
      <h2 style={{ color: "#ffffff", marginBottom: "20px" }}>Tabela ligi</h2>
      <div style={{ marginBottom: "20px" }}>
        <Link 
          to={`/league/${leagueId}/matches`} 
          style={{ 
            marginRight: "10px", 
            color: "#4fc3f7", 
            textDecoration: "none",
            padding: "8px 12px",
            border: "1px solid #4fc3f7",
            borderRadius: "4px",
            display: "inline-block"
          }}
        >
          📅 Zobacz terminarz
        </Link>
        <Link 
          to={`/admin/matches/new?league=${leagueId}`}
          style={{ 
            color: "#4caf50", 
            textDecoration: "none",
            padding: "8px 12px",
            border: "1px solid #4caf50",
            borderRadius: "4px",
            display: "inline-block"
          }}
        >
          ➕ Dodaj mecz
        </Link>
      </div>
      
      {standings.length === 0 ? (
        <p style={{ color: "#e0e0e0" }}>Brak danych w tabeli. Dodaj drużyny i mecze.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #444", backgroundColor: "#2a2a2a" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a1a1a" }}>
              <th style={tableHeaderStyle}>Poz.</th>
              <th style={tableHeaderStyle}>Drużyna</th>
              <th style={tableHeaderStyle}>Mecze</th>
              <th style={tableHeaderStyle}>Z</th>
              <th style={tableHeaderStyle}>R</th>
              <th style={tableHeaderStyle}>P</th>
              <th style={tableHeaderStyle}>Bramki</th>
              <th style={tableHeaderStyle}>Bilans</th>
              <th style={tableHeaderStyle}>Pkt</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr key={team.team_id} style={{ backgroundColor: index % 2 === 0 ? "#333333" : "#2a2a2a" }}>
                <td style={tableCellStyle}>{team.position}</td>
                <td style={tableCellStyle}>
                  <Link 
                    to={`/team/${team.team_id}`} 
                    style={{ color: "#4fc3f7", textDecoration: "none" }}
                    onMouseOver={(e) => e.target.style.color = "#81d4fa"}
                    onMouseOut={(e) => e.target.style.color = "#4fc3f7"}
                  >
                    {team.team_name}
                  </Link>
                </td>
                <td style={tableCellStyle}>{team.matches_played}</td>
                <td style={tableCellStyle}>{team.wins}</td>
                <td style={tableCellStyle}>{team.draws}</td>
                <td style={tableCellStyle}>{team.losses}</td>
                <td style={tableCellStyle}>{team.goals_for}:{team.goals_against}</td>
                <td style={tableCellStyle}>
                  <span style={{ 
                    color: team.goal_difference >= 0 ? "#4caf50" : "#f44336",
                    fontWeight: "bold"
                  }}>
                    {team.goal_difference >= 0 ? "+" : ""}{team.goal_difference}
                  </span>
                </td>
                <td style={tableCellStyle}>
                  <strong style={{ color: "#ffeb3b" }}>{team.points}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  border: "1px solid #555",
  padding: "12px 8px",
  textAlign: "center",
  fontWeight: "bold",
  color: "#ffffff",
  backgroundColor: "#1a1a1a",
  fontSize: "14px"
};

const tableCellStyle = {
  border: "1px solid #555",
  padding: "10px 8px",
  textAlign: "center",
  color: "#e0e0e0",
  fontSize: "13px"
};
