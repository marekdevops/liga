import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function LeagueMatches() {
  const { leagueId } = useParams();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pobierz mecze
    const fetchData = async () => {
      try {
        // Pobierz drużyny
        const teamsResponse = await fetch(`/league/${leagueId}/teams`);
        const teamsData = await teamsResponse.json();
        
        // Utwórz mapę ID -> nazwa drużyny
        const teamsMap = {};
        teamsData.forEach(team => {
          teamsMap[team.id] = team.name;
        });
        setTeams(teamsMap);

        // Pobierz mecze
        const matchesResponse = await fetch(`/matches/league/${leagueId}?_t=${Date.now()}`);
        const matchesData = await matchesResponse.json();
        console.log("Pobrano mecze:", matchesData.length, "mecze");
        console.log("Kolejki:", [...new Set(matchesData.map(m => m.round_number))].sort());
        setMatches(matchesData);
        
        setLoading(false);
      } catch (err) {
        console.error("Błąd pobierania danych:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#1a1a1a", 
        color: "#ffffff", 
        minHeight: "100vh",
        textAlign: "center",
        fontSize: "18px"
      }}>
        Ładowanie terminarza...
      </div>
    );
  }

  // Grupuj mecze według kolejek
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round_number]) {
      acc[match.round_number] = [];
    }
    acc[match.round_number].push(match);
    return acc;
  }, {});

  console.log("matchesByRound:", matchesByRound);
  console.log("Liczba kolejek:", Object.keys(matchesByRound).length);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL") + " " + date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#1a1a1a", 
      color: "#ffffff", 
      minHeight: "100vh",
      width: "100%",
      overflow: "visible",
      height: "auto",
      position: "relative"
    }}>
      <h2 style={{ color: "#ffffff", marginBottom: "20px" }}>
        Terminarz rozgrywek (Kolejek: {Object.keys(matchesByRound).length}, Meczów: {matches.length})
      </h2>
      <div style={{ marginBottom: "20px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <Link 
          to="/"
          style={{ 
            color: "#FF9800",
            textDecoration: "none",
            padding: "8px 12px",
            border: "1px solid #FF9800",
            borderRadius: "4px",
            backgroundColor: "rgba(255, 152, 0, 0.1)"
          }}
        >
          🏠 Główne menu
        </Link>
        <Link 
          to={`/league/${leagueId}`} 
          style={{ 
            color: "#4CAF50",
            textDecoration: "none",
            padding: "8px 12px",
            border: "1px solid #4CAF50",
            borderRadius: "4px",
            backgroundColor: "rgba(76, 175, 80, 0.1)"
          }}
        >
          📊 Powrót do tabeli
        </Link>
        <Link 
          to={`/admin/matches/new?league=${leagueId}`}
          style={{ 
            color: "#2196F3",
            textDecoration: "none",
            padding: "8px 12px",
            border: "1px solid #2196F3",
            borderRadius: "4px",
            backgroundColor: "rgba(33, 150, 243, 0.1)"
          }}
        >
          ➕ Dodaj mecz
        </Link>
      </div>

      {Object.keys(matchesByRound).length === 0 ? (
        <p style={{ color: "#cccccc", fontSize: "16px" }}>Brak meczów w terminarzu.</p>
      ) : (
        <>
          {/* Nawigacja do kolejek */}
          <div style={{ 
            marginBottom: "20px", 
            padding: "10px", 
            backgroundColor: "#2a2a2a", 
            borderRadius: "8px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            <span style={{ color: "#cccccc" }}>Przejdź do kolejki:</span>
            {Object.keys(matchesByRound)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((round) => (
                <a
                  key={round}
                  href={`#round-${round}`}
                  style={{
                    color: "#4CAF50",
                    textDecoration: "none",
                    padding: "4px 8px",
                    border: "1px solid #4CAF50",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  {round}
                </a>
              ))}
          </div>

          {/* Kolejki */}
          {Object.keys(matchesByRound)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((round) => (
              <div key={round} id={`round-${round}`} style={{ marginBottom: "30px" }}>
                <h3 style={{ 
                  color: "#4CAF50", 
                  marginBottom: "15px",
                  borderBottom: "2px solid #4CAF50",
                  paddingBottom: "8px"
                }}>
                  Kolejka {round} ({matchesByRound[round].length} meczów)
                </h3>
              <div style={{ 
                border: "1px solid #444", 
                borderRadius: "8px", 
                padding: "15px",
                backgroundColor: "#2a2a2a"
              }}>
                {matchesByRound[round].map((match) => (
                  <div key={match.id} style={matchStyle}>
                    <div style={{ flex: 1, textAlign: "right", padding: "10px" }}>
                      <strong style={{ color: "#ffffff", fontSize: "16px" }}>
                        {teams[match.home_team_id] || `Drużyna ${match.home_team_id}`}
                      </strong>
                    </div>
                    
                    <div style={{ padding: "10px", minWidth: "150px", textAlign: "center" }}>
                      {match.is_finished ? (
                        <div style={{ 
                          fontSize: "28px", 
                          fontWeight: "bold", 
                          color: "#4CAF50",
                          padding: "10px",
                          border: "2px solid #4CAF50",
                          borderRadius: "8px",
                          backgroundColor: "rgba(76, 175, 80, 0.1)"
                        }}>
                          {match.home_goals} : {match.away_goals}
                        </div>
                      ) : (
                        <div>
                          <div style={{ 
                            fontSize: "14px", 
                            color: "#cccccc",
                            marginBottom: "8px"
                          }}>
                            {formatDate(match.match_date)}
                          </div>
                          <Link 
                            to={`/admin/matches/${match.id}/result`}
                            style={{ 
                              fontSize: "13px", 
                              color: "#FF9800", 
                              textDecoration: "none",
                              padding: "6px 10px",
                              border: "1px solid #FF9800",
                              borderRadius: "4px",
                              backgroundColor: "rgba(255, 152, 0, 0.1)",
                              display: "inline-block"
                            }}
                          >
                            ⚽ Dodaj wynik
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, textAlign: "left", padding: "10px" }}>
                      <strong style={{ color: "#ffffff", fontSize: "16px" }}>
                        {teams[match.away_team_id] || `Drużyna ${match.away_team_id}`}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const matchStyle = {
  display: "flex",
  alignItems: "center",
  borderBottom: "1px solid #444",
  padding: "15px 0",
  backgroundColor: "#333333",
  margin: "8px 0",
  borderRadius: "6px",
  border: "1px solid #555"
};
