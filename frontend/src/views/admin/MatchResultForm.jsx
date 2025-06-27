import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MatchResultForm() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // W prawdziwej aplikacji pobieralibyśmy szczegóły meczu
    // Na razie symulujemy
    setMatch({
      id: matchId,
      home_team_id: 1,
      away_team_id: 2,
      // Dodaj więcej szczegółów jak będzie potrzeba
    });
    setLoading(false);
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
    return <div>Ładowanie...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Dodaj wynik meczu</h2>
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <p>Mecz ID: {matchId}</p>
        <p>Drużyna gospodarzy (ID: {match?.home_team_id}) vs Drużyna gości (ID: {match?.away_team_id})</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ flex: 1 }}>
            <label>Bramki gospodarzy:</label>
            <input
              type="number"
              value={homeGoals}
              onChange={(e) => setHomeGoals(e.target.value)}
              min="0"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ fontSize: "24px", fontWeight: "bold" }}>:</div>

          <div style={{ flex: 1 }}>
            <label>Bramki gości:</label>
            <input
              type="number"
              value={awayGoals}
              onChange={(e) => setAwayGoals(e.target.value)}
              min="0"
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" style={buttonStyle}>
            Zapisz wynik
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            style={{ ...buttonStyle, backgroundColor: "#6c757d" }}
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "8px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  width: "100%"
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px"
};
