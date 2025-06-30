import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function LeagueDetails() {
  const { leagueId } = useParams();
  const [standings, setStandings] = useState([]);
  const [topPlayers, setTopPlayers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("LeagueDetails component loaded with leagueId:", leagueId);
  console.log("Current state - loading:", loading, "standings:", standings.length, "topPlayers:", topPlayers);

  const handleGenerateSchedule = async () => {
    if (window.confirm("Czy na pewno chcesz wygenerować kompletny terminarz dla tej ligi? To może nadpisać istniejące mecze.")) {
      try {
        const response = await fetch(`/matches/league/${leagueId}/generate-schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.json();
          alert(`${result.message}\nLiczba meczów: ${result.total_matches}\nLiczba kolejek: ${result.total_rounds}`);
          // Odśwież tabelę po wygenerowaniu terminarza
          window.location.reload();
        } else {
          const error = await response.json();
          alert(`Błąd: ${error.detail}`);
        }
      } catch (err) {
        console.error("Błąd:", err);
        alert("Wystąpił błąd podczas generowania terminarza.");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for league:", leagueId);
        
        // Pobierz tabelę ligi
        const standingsResponse = await fetch(`/matches/league/${leagueId}/table`);
        console.log("Standings response status:", standingsResponse.status);
        
        if (standingsResponse.ok) {
          const standingsData = await standingsResponse.json();
          console.log("Standings data:", standingsData);
          setStandings(standingsData);
          // Temporary alert for debugging
          if (standingsData.length > 0) {
            console.log("Setting standings with", standingsData.length, "teams");
          }
        } else {
          console.error("Failed to fetch standings:", standingsResponse.status);
        }

        // Pobierz statystyki indywidualne
        const playersResponse = await fetch(`/matches/league/${leagueId}/top-players`);
        console.log("Players response status:", playersResponse.status);
        
        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          console.log("Players data:", playersData);
          setTopPlayers(playersData);
        } else {
          console.error("Failed to fetch top players:", playersResponse.status);
        }
      } catch (err) {
        console.error("Błąd pobierania danych:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchData();
    }
  }, [leagueId]);

  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#1e1e1e", 
        minHeight: "100vh",
        color: "#e0e0e0",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>⚽ Ładowanie danych ligi...</div>
          <div style={{ color: "#4fc3f7" }}>Liga ID: {leagueId}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#1e1e1e", 
        minHeight: "100vh",
        color: "#e0e0e0",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#f44336" }}>❌ Błąd ładowania danych</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: "10px 20px",
            backgroundColor: "#4fc3f7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🔄 Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#1e1e1e", 
      minHeight: "100vh",
      color: "#e0e0e0"
    }}>
      <h2 style={{ color: "#ffffff", marginBottom: "20px" }}>
        Tabela ligi (ID: {leagueId}) - Dane: {standings.length} drużyn
      </h2>
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
            marginRight: "10px",
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
        <button
          onClick={handleGenerateSchedule}
          style={{ 
            color: "#ff9800", 
            backgroundColor: "transparent",
            textDecoration: "none",
            padding: "8px 12px",
            border: "1px solid #ff9800",
            borderRadius: "4px",
            display: "inline-block",
            cursor: "pointer"
          }}
        >
          ⚡ Generuj terminarz
        </button>
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

      {/* Statystyki indywidualne */}
      {topPlayers && (topPlayers.top_goalscorers?.length > 0 || topPlayers.top_assisters?.length > 0) && (
        <div style={{ marginTop: "40px" }}>
          <h3 style={{ color: "#ffffff", marginBottom: "30px", textAlign: "center" }}>
            📊 Statystyki indywidualne
          </h3>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "30px",
            '@media (max-width: 768px)': {
              gridTemplateColumns: "1fr"
            }
          }}>
            {/* Top strzelcy */}
            <div>
              <h4 style={{ 
                color: "#4caf50", 
                marginBottom: "15px", 
                textAlign: "center",
                backgroundColor: "#2a2a2a",
                padding: "10px",
                borderRadius: "8px"
              }}>
                ⚽ Top 5 Strzelców
              </h4>
              
              {(!topPlayers.top_goalscorers || topPlayers.top_goalscorers.length === 0) ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#aaa", 
                  fontStyle: "italic",
                  padding: "20px",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "8px"
                }}>
                  Brak danych o bramkach
                </div>
              ) : (
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse", 
                  backgroundColor: "#2a2a2a", 
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#4caf50" }}>
                      <th style={{ ...tableHeaderStyle, backgroundColor: "#4caf50" }}>Poz.</th>
                      <th style={{ ...tableHeaderStyle, backgroundColor: "#4caf50" }}>Zawodnik</th>
                      <th style={{ ...tableHeaderStyle, backgroundColor: "#4caf50" }}>Drużyna</th>
                      <th style={{ ...tableHeaderStyle, backgroundColor: "#4caf50" }}>Bramki</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPlayers.top_goalscorers.map((player, index) => (
                      <tr key={player.id} style={{ backgroundColor: index % 2 === 0 ? "#333333" : "#2a2a2a" }}>
                        <td style={tableCellStyle}>
                          <span style={{ 
                            fontWeight: "bold", 
                            color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#ffffff"
                          }}>
                            {index + 1}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          #{player.shirt_number} {player.first_name} {player.last_name}
                        </td>
                        <td style={tableCellStyle}>{player.team_name}</td>
                        <td style={{ ...tableCellStyle, fontWeight: "bold", color: "#4caf50" }}>
                          {player.total_goals}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Top asystenci */}
            <div>
              <h4 style={{ 
                color: "#2196F3", 
                marginBottom: "15px", 
                textAlign: "center",
                backgroundColor: "#2a2a2a",
                padding: "10px",
                borderRadius: "8px"
              }}>
                🅰️ Top 5 Asystentów
              </h4>
              
              {(!topPlayers.top_assisters || topPlayers.top_assisters.length === 0) ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#aaa", 
                  fontStyle: "italic",
                  padding: "20px",
                  backgroundColor: "#2a2a2a",
                  borderRadius: "8px"
                }}>
                  Brak danych o asystach
                </div>
              ) : (
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse", 
                  backgroundColor: "#2a2a2a", 
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#2196F3" }}>
                      <th style={{ ...tableHeaderStyle, backgroundColor: "#2196F3" }}>Poz.</th>
                      <th style={{ ...tableHeaderStyle, backgroundColor: "#2196F3" }}>Zawodnik</th>
                      <th style={{ ...tableHeaderStyle, backgroundColor: "#2196F3" }}>Drużyna</th>
                      <th style={{ ...tableHeaderStyle, backgroundColor: "#2196F3" }}>Asysty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPlayers.top_assisters.map((player, index) => (
                      <tr key={player.id} style={{ backgroundColor: index % 2 === 0 ? "#333333" : "#2a2a2a" }}>
                        <td style={tableCellStyle}>
                          <span style={{ 
                            fontWeight: "bold", 
                            color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#ffffff"
                          }}>
                            {index + 1}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          #{player.shirt_number} {player.first_name} {player.last_name}
                        </td>
                        <td style={tableCellStyle}>{player.team_name}</td>
                        <td style={{ ...tableCellStyle, fontWeight: "bold", color: "#2196F3" }}>
                          {player.total_assists}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
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
