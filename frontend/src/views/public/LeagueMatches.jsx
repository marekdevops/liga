import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function LeagueMatches() {
  const { leagueId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/matches/league/${leagueId}`)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania meczów:", err);
        setLoading(false);
      });
  }, [leagueId]);

  if (loading) {
    return <div>Ładowanie terminarza...</div>;
  }

  // Grupuj mecze według kolejek
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round_number]) {
      acc[match.round_number] = [];
    }
    acc[match.round_number].push(match);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL") + " " + date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Terminarz rozgrywek</h2>
      <div style={{ marginBottom: "20px" }}>
        <Link to={`/league/${leagueId}`} style={{ marginRight: "10px" }}>
          📊 Powrót do tabeli
        </Link>
        <Link to={`/admin/matches/new?league=${leagueId}`}>
          ➕ Dodaj mecz
        </Link>
      </div>

      {Object.keys(matchesByRound).length === 0 ? (
        <p>Brak meczów w terminarzu.</p>
      ) : (
        Object.keys(matchesByRound)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((round) => (
            <div key={round} style={{ marginBottom: "30px" }}>
              <h3>Kolejka {round}</h3>
              <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
                {matchesByRound[round].map((match) => (
                  <div key={match.id} style={matchStyle}>
                    <div style={{ flex: 1, textAlign: "right", padding: "10px" }}>
                      <strong>Drużyna gospodarzy (ID: {match.home_team_id})</strong>
                    </div>
                    
                    <div style={{ padding: "10px", minWidth: "120px", textAlign: "center" }}>
                      {match.is_finished ? (
                        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
                          {match.home_goals} : {match.away_goals}
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: "14px", color: "#666" }}>
                            {formatDate(match.match_date)}
                          </div>
                          <Link 
                            to={`/admin/matches/${match.id}/result`}
                            style={{ fontSize: "12px", color: "#007bff", textDecoration: "none" }}
                          >
                            ⚽ Dodaj wynik
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, textAlign: "left", padding: "10px" }}>
                      <strong>Drużyna gości (ID: {match.away_team_id})</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}

const matchStyle = {
  display: "flex",
  alignItems: "center",
  borderBottom: "1px solid #eee",
  padding: "15px 0",
  backgroundColor: "#f9f9f9",
  margin: "5px 0",
  borderRadius: "4px"
};
