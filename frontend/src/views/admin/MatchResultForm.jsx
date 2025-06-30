import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MatchResultForm() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState({});
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pobierz szczegóły meczu i nazwy drużyn
    const fetchMatchDetails = async () => {
      try {
        // Pobierz mecz
        const matchResponse = await fetch(`/matches/${matchId}`);
        if (!matchResponse.ok) {
          throw new Error("Mecz nie znaleziony");
        }
        const matchData = await matchResponse.json();
        setMatch(matchData);

        // Pobierz wszystkie drużyny z ligi
        const teamsResponse = await fetch(`/league/${matchData.league_id}/teams`);
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          
          // Utwórz mapę ID -> nazwa drużyny
          const teamsMap = {};
          teamsData.forEach(team => {
            teamsMap[team.id] = team.name;
          });
          setTeams(teamsMap);
          
          console.log("Mapa drużyn:", teamsMap);
          console.log("Drużyna gospodarzy:", teamsMap[matchData.home_team_id]);
          console.log("Drużyna gości:", teamsMap[matchData.away_team_id]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Błąd pobierania meczu:", err);
        alert("Nie można pobrać szczegółów meczu");
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [matchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (homeGoals === "" || awayGoals === "") {
      alert("Proszę wprowadzić wyniki dla obu drużyn.");
      return;
    }

    const resultData = {
      home_goals: parseInt(homeGoals),
      away_goals: parseInt(awayGoals),
    };

    try {
      const response = await fetch(`/matches/${matchId}/result`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData),
      });

      if (response.ok) {
        alert("Wynik meczu został zapisany!");
        navigate(-1); // Powrót do poprzedniej strony
      } else {
        const error = await response.json();
        alert(`Błąd: ${error.detail}`);
      }
    } catch (err) {
      console.error("Błąd:", err);
      alert("Wystąpił błąd podczas zapisywania wyniku.");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        minHeight: "100vh"
      }}>
        Ładowanie szczegółów meczu...
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL") + " " + date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "600px", 
      margin: "0 auto",
      backgroundColor: "#1a1a1a",
      color: "#ffffff",
      minHeight: "100vh"
    }}>
      <h2 style={{ 
        color: "#ffffff", 
        textAlign: "center", 
        marginBottom: "30px",
        fontSize: "24px"
      }}>
        ⚽ Dodaj wynik meczu
      </h2>
      
      {/* Informacje o meczu - bez ID */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        border: "2px solid #4CAF50", 
        borderRadius: "10px",
        backgroundColor: "#2a2a2a",
        textAlign: "center"
      }}>
        <div style={{ 
          fontSize: "20px", 
          fontWeight: "bold", 
          marginBottom: "10px",
          color: "#4CAF50"
        }}>
          {teams[match?.home_team_id] || 'Drużyna gospodarzy'} 
          <span style={{ color: "#ffffff", margin: "0 15px" }}>VS</span>
          {teams[match?.away_team_id] || 'Drużyna gości'}
        </div>
        <div style={{ 
          fontSize: "14px", 
          color: "#cccccc",
          marginTop: "8px"
        }}>
          📅 {formatDate(match?.match_date)}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "20px",
          backgroundColor: "#2a2a2a",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #555"
        }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "bold",
              color: "#4CAF50"
            }}>
              {teams[match?.home_team_id] || 'Gospodarze'}
            </label>
            <input
              type="number"
              value={homeGoals}
              onChange={(e) => setHomeGoals(e.target.value)}
              min="0"
              max="20"
              required
              style={{...inputStyle, textAlign: "center", fontSize: "18px"}}
              placeholder="0"
            />
          </div>

          <div style={{ 
            fontSize: "32px", 
            fontWeight: "bold",
            color: "#ffffff" 
          }}>
            :
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "bold",
              color: "#FF9800"
            }}>
              {teams[match?.away_team_id] || 'Goście'}
            </label>
            <input
              type="number"
              value={awayGoals}
              onChange={(e) => setAwayGoals(e.target.value)}
              min="0"
              max="20"
              required
              style={{...inputStyle, textAlign: "center", fontSize: "18px"}}
              placeholder="0"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <button type="submit" style={buttonStyle}>
            ✅ Zapisz wynik
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            style={{ ...buttonStyle, backgroundColor: "#6c757d" }}
          >
            ❌ Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  border: "2px solid #555",
  borderRadius: "8px",
  fontSize: "18px",
  width: "100%",
  backgroundColor: "#333",
  color: "#ffffff",
  fontWeight: "bold"
};

const buttonStyle = {
  padding: "12px 30px",
  backgroundColor: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "background-color 0.3s"
};
