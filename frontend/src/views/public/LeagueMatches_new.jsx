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
        const teamsResponse = await fetch(`/api/league/${leagueId}/teams`);
        const teamsData = await teamsResponse.json();
        
        // Utwórz mapę ID -> nazwa drużyny
        const teamsMap = {};
        teamsData.forEach(team => {
          teamsMap[team.id] = team.name;
        });
        setTeams(teamsMap);

        // Pobierz mecze
        const matchesResponse = await fetch(`/api/matches/league/${leagueId}?_t=${Date.now()}`);
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
  console.log("Wszystkie klucze kolejek:", Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b)));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL") + " " + date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  };

  const MatchCard = ({ match }) => (
    <div style={matchStyle}>
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
  );

  return (
    <div style={{ 
      backgroundColor: "#1a1a1a", 
      color: "#ffffff", 
      minHeight: "100vh",
      width: "100%"
    }}>
      {/* Niebieski nagłówek */}
      <div style={{
        backgroundColor: "#2196F3",
        padding: "30px 20px",
        marginBottom: "0",
        borderBottom: "4px solid #1976D2",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ 
            color: "#ffffff", 
            margin: "0 0 10px 0",
            fontSize: "36px",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}>
            ⚽ TERMINARZ ROZGRYWEK
          </h1>
          <div style={{
            textAlign: "center",
            fontSize: "18px",
            color: "#E3F2FD",
            fontWeight: "500"
          }}>
            Kolejek: {Object.keys(matchesByRound).length} | Meczów: {matches.length}
          </div>
        </div>
      </div>

      {/* Główny kontener */}
      <div style={{ 
        padding: "30px 20px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        
        {/* Przyciski nawigacyjne */}
        <div style={{ marginBottom: "30px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <Link 
            to="/"
            style={{ 
              color: "#FF9800",
              textDecoration: "none",
              padding: "12px 20px",
              border: "2px solid #FF9800",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              fontWeight: "bold",
              fontSize: "16px"
            }}
          >
            🏠 Główne menu
          </Link>
          <Link 
            to={`/league/${leagueId}`} 
            style={{ 
              color: "#4CAF50",
              textDecoration: "none",
              padding: "12px 20px",
              border: "2px solid #4CAF50",
              borderRadius: "8px",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              fontWeight: "bold",
              fontSize: "16px"
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
              marginBottom: "50px",
              backgroundColor: "#1B5E20",
              borderRadius: "15px",
              padding: "30px",
              border: "3px solid #4CAF50",
              boxShadow: "0 6px 12px rgba(0,0,0,0.4)"
            }}>
              <h2 style={{
                color: "#A5D6A7",
                textAlign: "center",
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "30px",
                borderBottom: "3px solid #4CAF50",
                paddingBottom: "15px"
              }}>
                🏆 RUNDA ZASADNICZA (Kolejki 1-3)
              </h2>
              
              {Object.keys(matchesByRound)
                .filter(round => parseInt(round) <= 3)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((round) => (
                  <div key={round} style={{ marginBottom: "30px" }}>
                    <h3 style={{ 
                      color: "#C8E6C9", 
                      marginBottom: "20px",
                      fontSize: "24px",
                      fontWeight: "bold",
                      paddingLeft: "10px",
                      borderLeft: "5px solid #4CAF50"
                    }}>
                      ⚽ Kolejka {round} ({matchesByRound[round].length} meczów)
                    </h3>
                    <div style={{ 
                      backgroundColor: "#2E7D32",
                      borderRadius: "10px", 
                      padding: "20px",
                      border: "2px solid #4CAF50"
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
              marginBottom: "50px",
              backgroundColor: "#E65100",
              borderRadius: "15px",
              padding: "30px",
              border: "3px solid #FF9800",
              boxShadow: "0 6px 12px rgba(0,0,0,0.4)"
            }}>
              <h2 style={{
                color: "#FFE0B2",
                textAlign: "center",
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "30px",
                borderBottom: "3px solid #FF9800",
                paddingBottom: "15px"
              }}>
                🔄 REWANŻE (Kolejki 4-6)
              </h2>
              
              {Object.keys(matchesByRound)
                .filter(round => parseInt(round) > 3)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((round) => (
                  <div key={round} style={{ marginBottom: "30px" }}>
                    <h3 style={{ 
                      color: "#FFF3E0", 
                      marginBottom: "20px",
                      fontSize: "24px",
                      fontWeight: "bold",
                      paddingLeft: "10px",
                      borderLeft: "5px solid #FF9800"
                    }}>
                      🔄 Kolejka {round} ({matchesByRound[round].length} meczów) - Rewanże
                    </h3>
                    <div style={{ 
                      backgroundColor: "#F57C00",
                      borderRadius: "10px", 
                      padding: "20px",
                      border: "2px solid #FF9800"
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
              marginTop: "40px",
              padding: "20px",
              backgroundColor: "#2a2a2a",
              borderRadius: "10px",
              textAlign: "center",
              border: "2px dashed #666"
            }}>
              <h4 style={{ color: "#888", margin: 0, fontSize: "18px" }}>
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
  padding: "15px 0",
  backgroundColor: "#333333",
  margin: "8px 0",
  borderRadius: "6px",
  border: "1px solid #555"
};
