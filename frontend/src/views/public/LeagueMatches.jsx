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
      <div style={{ flex: 1, textAlign: "right", padding: "4px", minWidth: "0", fontSize: "12px" }}>
        <strong style={{ 
          color: "#ffffff", 
          fontSize: "12px",
          wordBreak: "break-word",
          display: "block",
          lineHeight: "1.2"
        }}>
          {teams[match.home_team_id] || `Drużyna ${match.home_team_id}`}
        </strong>
      </div>
      
      <div style={{ padding: "4px", minWidth: "80px", textAlign: "center", flexShrink: 0 }}>
        {match.is_finished ? (
          <div style={{ 
            fontSize: "16px", 
            fontWeight: "bold", 
            color: "#4CAF50",
            padding: "4px",
            border: "1px solid #4CAF50",
            borderRadius: "4px",
            backgroundColor: "rgba(76, 175, 80, 0.1)"
          }}>
            {match.home_goals} : {match.away_goals}
          </div>
        ) : (
          <div>
            <div style={{ 
              fontSize: "9px", 
              color: "#cccccc",
              marginBottom: "3px",
              lineHeight: "1.1"
            }}>
              {formatDate(match.match_date)}
            </div>
            <Link 
              to={`/admin/matches/${match.id}/result`}
              style={{ 
                fontSize: "9px", 
                color: "#FF9800", 
                textDecoration: "none",
                padding: "2px 4px",
                border: "1px solid #FF9800",
                borderRadius: "3px",
                backgroundColor: "rgba(255, 152, 0, 0.1)",
                display: "inline-block"
              }}
            >
              ⚽ Wynik
            </Link>
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, textAlign: "left", padding: "4px", minWidth: "0", fontSize: "12px" }}>
        <strong style={{ 
          color: "#ffffff", 
          fontSize: "12px",
          wordBreak: "break-word",
          display: "block",
          lineHeight: "1.2"
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
        padding: "8px 5px",
        marginBottom: "0",
        borderBottom: "2px solid #1976D2",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
      }}>
        <div style={{ maxWidth: "100%", margin: "0 auto", padding: "0 5px" }}>
          <h1 style={{ 
            color: "#ffffff", 
            margin: "0 0 4px 0",
            fontSize: "18px",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
          }}>
            ⚽ TERMINARZ ROZGRYWEK
          </h1>
          <div style={{
            textAlign: "center",
            fontSize: "12px",
            color: "#E3F2FD",
            fontWeight: "500"
          }}>
            Kolejek: {Object.keys(matchesByRound).length} | Meczów: {matches.length}
          </div>
        </div>
      </div>

      {/* Główny kontener */}
      <div style={{ 
        padding: "8px 5px",
        maxWidth: "100%",
        margin: "0 auto",
        overflow: "hidden"
      }}>
        
        {/* Przyciski nawigacyjne */}
        <div style={{ marginBottom: "8px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
          <Link 
            to="/"
            style={{ 
              color: "#FF9800",
              textDecoration: "none",
              padding: "6px 8px",
              border: "1px solid #FF9800",
              borderRadius: "4px",
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              fontWeight: "bold",
              fontSize: "12px",
              flex: "1",
              textAlign: "center",
              minWidth: "100px"
            }}
          >
            🏠 Menu
          </Link>
          <Link 
            to={`/league/${leagueId}`} 
            style={{ 
              color: "#4CAF50",
              textDecoration: "none",
              padding: "6px 8px",
              border: "1px solid #4CAF50",
              borderRadius: "4px",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              fontWeight: "bold",
              fontSize: "12px",
              flex: "1",
              textAlign: "center",
              minWidth: "100px"
            }}
          >
            📊 Tabela
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
              marginBottom: "10px",
              backgroundColor: "#1B5E20",
              borderRadius: "6px",
              padding: "8px",
              border: "1px solid #4CAF50",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              <h2 style={{
                color: "#A5D6A7",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "8px",
                borderBottom: "1px solid #4CAF50",
                paddingBottom: "4px"
              }}>
                🏆 RUNDA ZASADNICZA (1-3)
              </h2>
              
              {Object.keys(matchesByRound)
                .filter(round => parseInt(round) <= 3)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((round) => (
                  <div key={round} style={{ marginBottom: "8px" }}>
                    <h3 style={{ 
                      color: "#C8E6C9", 
                      marginBottom: "6px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      paddingLeft: "6px",
                      borderLeft: "2px solid #4CAF50"
                    }}>
                      ⚽ Kolejka {round} ({matchesByRound[round].length})
                    </h3>
                    <div style={{ 
                      backgroundColor: "#2E7D32",
                      borderRadius: "4px", 
                      padding: "6px",
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
              marginBottom: "10px",
              backgroundColor: "#E65100",
              borderRadius: "6px",
              padding: "8px",
              border: "1px solid #FF9800",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}>
              <h2 style={{
                color: "#FFE0B2",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "8px",
                borderBottom: "1px solid #FF9800",
                paddingBottom: "4px"
              }}>
                🔄 REWANŻE (4-6)
              </h2>
              
              {Object.keys(matchesByRound)
                .filter(round => parseInt(round) > 3)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((round) => (
                  <div key={round} style={{ marginBottom: "8px" }}>
                    <h3 style={{ 
                      color: "#FFF3E0", 
                      marginBottom: "6px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      paddingLeft: "6px",
                      borderLeft: "2px solid #FF9800"
                    }}>
                      🔄 Kolejka {round} ({matchesByRound[round].length})
                    </h3>
                    <div style={{ 
                      backgroundColor: "#F57C00",
                      borderRadius: "4px", 
                      padding: "6px",
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
              marginTop: "10px",
              padding: "8px",
              backgroundColor: "#2a2a2a",
              borderRadius: "4px",
              textAlign: "center",
              border: "1px dashed #666"
            }}>
              <h4 style={{ color: "#888", margin: 0, fontSize: "12px" }}>
                🏁 {matches.length} meczów w {Object.keys(matchesByRound).length} kolejkach
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
  padding: "4px 0",
  backgroundColor: "#333333",
  margin: "2px 0",
  borderRadius: "3px",
  border: "1px solid #555",
  minHeight: "auto",
  width: "100%",
  boxSizing: "border-box"
};
