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
      <div style={{ flex: 1, textAlign: "right", padding: "10px", minWidth: "0" }}>
        <strong style={{ 
          color: "#ffffff", 
          fontSize: "14px",
          wordBreak: "break-word",
          display: "block",
          lineHeight: "1.4"
        }}>
          {teams[match.home_team_id] || `Drużyna ${match.home_team_id}`}
        </strong>
      </div>
      
      <div style={{ padding: "10px", minWidth: "140px", textAlign: "center", flexShrink: 0 }}>
        {match.is_finished ? (
          <div style={{ 
            fontSize: "22px", 
            fontWeight: "bold", 
            color: "#4CAF50",
            padding: "8px",
            border: "2px solid #4CAF50",
            borderRadius: "6px",
            backgroundColor: "rgba(76, 175, 80, 0.1)"
          }}>
            {match.home_goals} : {match.away_goals}
          </div>
        ) : (
          <div>
            <div style={{ 
              fontSize: "12px", 
              color: "#cccccc",
              marginBottom: "6px",
              lineHeight: "1.3"
            }}>
              {formatDate(match.match_date)}
            </div>
            <Link 
              to={`/admin/matches/${match.id}/result`}
              style={{ 
                fontSize: "12px", 
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
      
      <div style={{ flex: 1, textAlign: "left", padding: "10px", minWidth: "0" }}>
        <strong style={{ 
          color: "#ffffff", 
          fontSize: "14px",
          wordBreak: "break-word",
          display: "block",
          lineHeight: "1.4"
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
      margin: 0,
      padding: 0
    }}>
      {/* Niebieski nagłówek - pełna szerokość ekranu */}
      <div style={{
        backgroundColor: "#2196F3",
        padding: "20px 15px",
        borderBottom: "3px solid #1976D2",
        boxShadow: "0 3px 6px rgba(0,0,0,0.3)"
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ 
            color: "#ffffff", 
            margin: "0 0 10px 0",
            fontSize: "28px",
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}>
            ⚽ TERMINARZ ROZGRYWEK
          </h1>
          <div style={{
            fontSize: "16px",
            color: "#E3F2FD",
            fontWeight: "500"
          }}>
            Kolejek: {Object.keys(matchesByRound).length} | Meczów: {matches.length}
          </div>
        </div>
      </div>

      {/* Przyciski nawigacyjne */}
      <div style={{ 
        padding: "15px",
        display: "flex", 
        gap: "15px", 
        justifyContent: "center",
        backgroundColor: "#1a1a1a"
      }}>
        <Link 
          to="/"
          style={{ 
            color: "#FF9800",
            textDecoration: "none",
            padding: "12px 24px",
            border: "2px solid #FF9800",
            borderRadius: "6px",
            backgroundColor: "rgba(255, 152, 0, 0.1)",
            fontWeight: "bold",
            fontSize: "14px"
          }}
        >
          🏠 Główne Menu
        </Link>
        <Link 
          to={`/league/${leagueId}`} 
          style={{ 
            color: "#4CAF50",
            textDecoration: "none",
            padding: "12px 24px",
            border: "2px solid #4CAF50",
            borderRadius: "6px",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            fontWeight: "bold",
            fontSize: "14px"
          }}
        >
          📊 Powrót do Tabeli
        </Link>
      </div>

      {/* Główny kontener z kaflami */}
      <div style={{ 
        padding: "0 10px 15px 10px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "15px",
        width: "100%",
        boxSizing: "border-box",
        maxWidth: "100%"
      }}>

        {Object.keys(matchesByRound).length === 0 ? (
          <div style={{ 
            gridColumn: "1 / -1",
            color: "#cccccc", 
            fontSize: "18px", 
            textAlign: "center",
            padding: "40px"
          }}>
            Brak meczów w terminarzu.
          </div>
        ) : (
          <>
            {/* RUNDA ZASADNICZA - każda kolejka jako osobny kafel */}
            {Object.keys(matchesByRound)
              .filter(round => parseInt(round) <= 3)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((round) => (
                <div key={`round-${round}`} style={{
                  backgroundColor: "#1B5E20",
                  borderRadius: "10px",
                  padding: "20px",
                  border: "2px solid #4CAF50",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
                }}>
                  <h3 style={{ 
                    color: "#A5D6A7", 
                    marginBottom: "15px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textAlign: "center",
                    borderBottom: "2px solid #4CAF50",
                    paddingBottom: "10px"
                  }}>
                    🏆 KOLEJKA {round} - RUNDA ZASADNICZA
                  </h3>
                  <div style={{ 
                    backgroundColor: "#2E7D32",
                    borderRadius: "8px", 
                    padding: "15px",
                    border: "1px solid #4CAF50"
                  }}>
                    {matchesByRound[round].map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                  <div style={{
                    textAlign: "center",
                    marginTop: "10px",
                    color: "#C8E6C9",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    {matchesByRound[round].length} meczów
                  </div>
                </div>
              ))}

            {/* REWANŻE - każda kolejka jako osobny kafel */}
            {Object.keys(matchesByRound)
              .filter(round => parseInt(round) > 3)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((round) => (
                <div key={`round-${round}`} style={{
                  backgroundColor: "#E65100",
                  borderRadius: "10px",
                  padding: "20px",
                  border: "2px solid #FF9800",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
                }}>
                  <h3 style={{ 
                    color: "#FFE0B2", 
                    marginBottom: "15px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textAlign: "center",
                    borderBottom: "2px solid #FF9800",
                    paddingBottom: "10px"
                  }}>
                    🔄 KOLEJKA {round} - REWANŻE
                  </h3>
                  <div style={{ 
                    backgroundColor: "#F57C00",
                    borderRadius: "8px", 
                    padding: "15px",
                    border: "1px solid #FF9800"
                  }}>
                    {matchesByRound[round].map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                  <div style={{
                    textAlign: "center",
                    marginTop: "10px",
                    color: "#FFF3E0",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    {matchesByRound[round].length} meczów
                  </div>
                </div>
              ))}

            {/* Stopka - rozciągnięta na całą szerokość */}
            <div style={{
              gridColumn: "1 / -1",
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#2a2a2a",
              borderRadius: "8px",
              textAlign: "center",
              border: "2px dashed #666"
            }}>
              <h4 style={{ color: "#888", margin: 0, fontSize: "16px" }}>
                🏁 Terminarz kompletny - {matches.length} meczów w {Object.keys(matchesByRound).length} kolejkach
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
  padding: "10px 0",
  backgroundColor: "#333333",
  margin: "6px 0",
  borderRadius: "6px",
  border: "1px solid #555",
  minHeight: "auto",
  width: "100%",
  boxSizing: "border-box"
};
