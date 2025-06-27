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
    <div style={{ padding: "20px" }}>
      <h2>Tabela ligi</h2>
      <div style={{ marginBottom: "20px" }}>
        <Link to={`/league/${leagueId}/matches`} style={{ marginRight: "10px" }}>
          📅 Zobacz terminarz
        </Link>
        <Link to={`/admin/matches/new?league=${leagueId}`}>
          ➕ Dodaj mecz
        </Link>
      </div>
      
      {standings.length === 0 ? (
        <p>Brak danych w tabeli. Dodaj drużyny i mecze.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
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
            {standings.map((team) => (
              <tr key={team.team_id}>
                <td style={tableCellStyle}>{team.position}</td>
                <td style={tableCellStyle}>
                  <Link to={`/team/${team.team_id}`}>{team.team_name}</Link>
                </td>
                <td style={tableCellStyle}>{team.matches_played}</td>
                <td style={tableCellStyle}>{team.wins}</td>
                <td style={tableCellStyle}>{team.draws}</td>
                <td style={tableCellStyle}>{team.losses}</td>
                <td style={tableCellStyle}>{team.goals_for}:{team.goals_against}</td>
                <td style={tableCellStyle}>
                  <span style={{ color: team.goal_difference >= 0 ? "green" : "red" }}>
                    {team.goal_difference >= 0 ? "+" : ""}{team.goal_difference}
                  </span>
                </td>
                <td style={tableCellStyle}><strong>{team.points}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
  fontWeight: "bold"
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center"
};
