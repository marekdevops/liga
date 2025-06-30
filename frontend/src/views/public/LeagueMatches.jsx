import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function LeagueMatches() {
  const { leagueId } = useParams();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
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
  console.log("Wszystkie klucze kolejek:", Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b)));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL") + " " + date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  };

  const MatchCard = ({ match }) => (
    <div style={matchStyle}>
      <div style={{ flex: 1, textAlign: "right", padding: "8px", minWidth: "0" }}>
        <strong style={{ 
          color: "#ffffff", 
          fontSize: "14px",
          wordBreak: "break-word",
          display: "block"
        }}>
          {teams[match.home_team_id] || `Drużyna ${match.home_team_id}`}
        </strong>
      </div>
      
      <div style={{ padding: "8px", minWidth: "120px", textAlign: "center", flexShrink: 0 }}>
        {match.is_finished ? (
          <div style={{ 
            fontSize: "20px", 
            fontWeight: "bold", 
            color: "#4CAF50",
            padding: "6px",
            border: "2px solid #4CAF50",
            borderRadius: "6px",
            backgroundColor: "rgba(76, 175, 80, 0.1)"
          }}>
            {match.home_goals} : {match.away_goals}
          </div>
        ) : (
          <div>
            <div style={{ 
              fontSize: "11px", 
              color: "#cccccc",
              marginBottom: "6px"
            }}>
              {formatDate(match.match_date)}
            </div>
            <Link 
              to={`/admin/matches/${match.id}/result`}
              style={{ 
                fontSize: "11px", 
                color: "#FF9800", 
                textDecoration: "none",
                padding: "4px 8px",
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
      
      <div style={{ flex: 1, textAlign: "left", padding: "8px", minWidth: "0" }}>
        <strong style={{ 
          color: "#ffffff", 
          fontSize: "14px",
          wordBreak: "break-word",
          display: "block"
        }}>
          {teams[match.away_team_id] || `Drużyna ${match.away_team_id}`}
        </strong>
      </div>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: "#1a1a1a", 
      color: "#ffffff", 
      minHeight: "100vh",
      width: "100%",
      overflow: "hidden"
    }}>
      {/* Niebieski nagłówek */}
      <div style={{
        backgroundColor: "#2196F3",
        padding: "15px 10px",
        marginBottom: "0",
        borderBottom: "4px solid #1976D2",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
      }}>
        <div style={{ maxWidth: "100%", margin: "0 auto", padding: "0 10px" }}>
          <h1 style={{ 
            color: "#ffffff", 
            margin: "0 0 8px 0",
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}>
            ⚽ TERMINARZ ROZGRYWEK
          </h1>
          <div style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#E3F2FD",
            fontWeight: "500"
          }}>
            Kolejek: {Object.keys(matchesByRound).length} | Meczów: {matches.length}
          </div>
        </div>
      </div>

      {/* Główny kontener */}
      <div style={{ 
        padding: "15px 10px",
        maxWidth: "100%",
        margin: "0 auto",
        overflow: "hidden"
      }}>
        
        {/* Przyciski nawigacyjne */}
        <div style={{ marginBottom: "15px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link 
            to="/"
            style={{ 
              color: "#FF9800",
              textDecoration: "none",
              padding: "8px 12px",
              border: "2px solid #FF9800",
              borderRadius: "6px",
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              fontWeight: "bold",
              fontSize: "14px",
              flex: "1",
              textAlign: "center",
              minWidth: "140px"
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
              border: "2px solid #4CAF50",
              borderRadius: "6px",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              fontWeight: "bold",
              fontSize: "14px",
              flex: "1",
              textAlign: "center",
              minWidth: "140px"
            }}
          >
            📊 Powrót do tabeli
          </Link>
        </div>

        {Object.keys(matchesByRound).length === 0 ? (
          <p style={{ color: "#cccccc", fontSize: "18px", textAlign: "center" }}>
            Brak meczów w terminarzu.
          </p>
        ) : (
          <>
            {/* SEKCJA: RUNDA ZASADNICZA */}
            <div style={{
              marginBottom: "20px",
              backgroundColor: "#1B5E20",
              borderRadius: "10px",
              padding: "15px",
              border: "2px solid #4CAF50",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
            }}>
              <h2 style={{
                color: "#A5D6A7",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "15px",
                borderBottom: "2px solid #4CAF50",
                paddingBottom: "8px"
              }}>
                🏆 RUNDA ZASADNICZA (Kolejki 1-3)
              </h2>
              
              {Object.keys(matchesByRound)
                .filter(round => parseInt(round) <= 3)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((round) => (
                  <div key={round} style={{ marginBottom: "15px" }}>
                    <h3 style={{ 
                      color: "#C8E6C9", 
                      marginBottom: "10px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      paddingLeft: "8px",
                      borderLeft: "3px solid #4CAF50"
                    }}>
                      ⚽ Kolejka {round} ({matchesByRound[round].length} meczów)
                    </h3>
                    <div style={{ 
                      backgroundColor: "#2E7D32",
                      borderRadius: "8px", 
                      padding: "10px",
                      border: "1px solid #4CAF50"
                    }}>
                      {matchesByRound[round].map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* SEKCJA: REWANŻE */}
            <div style={{
              marginBottom: "20px",
              backgroundColor: "#E65100",
              borderRadius: "10px",
              padding: "15px",
              border: "2px solid #FF9800",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
            }}>
              <h2 style={{
                color: "#FFE0B2",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "15px",
                borderBottom: "2px solid #FF9800",
                paddingBottom: "8px"
              }}>
                🔄 REWANŻE (Kolejki 4-6)
              </h2>
              
              {Object.keys(matchesByRound)
                .filter(round => parseInt(round) > 3)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((round) => (
                  <div key={round} style={{ marginBottom: "15px" }}>
                    <h3 style={{ 
                      color: "#FFF3E0", 
                      marginBottom: "10px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      paddingLeft: "8px",
                      borderLeft: "3px solid #FF9800"
                    }}>
                      🔄 Kolejka {round} ({matchesByRound[round].length} meczów) - Rewanże
                    </h3>
                    <div style={{ 
                      backgroundColor: "#F57C00",
                      borderRadius: "8px", 
                      padding: "10px",
                      border: "1px solid #FF9800"
                    }}>
                      {matchesByRound[round].map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Koniec terminarza */}
            <div style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#2a2a2a",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px dashed #666"
            }}>
              <h4 style={{ color: "#888", margin: 0, fontSize: "14px" }}>
                🏁 Koniec terminarza - Łącznie {matches.length} meczów w {Object.keys(matchesByRound).length} kolejkach
              </h4>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const matchStyle = {
  display: "flex",
  alignItems: "center",
  borderBottom: "1px solid #444",
  padding: "8px 0",
  backgroundColor: "#333333",
  margin: "4px 0",
  borderRadius: "4px",
  border: "1px solid #555",
  minHeight: "auto",
  width: "100%",
  boxSizing: "border-box"
};
