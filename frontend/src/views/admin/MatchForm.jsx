import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MatchForm() {
  const [teams, setTeams] = useState([]);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [roundNumber, setRoundNumber] = useState("");
  const [leagueId, setLeagueId] = useState("");
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Pobierz ID ligi z URL params jeśli dostępne
    const league = searchParams.get("league");
    if (league) {
      setLeagueId(league);
      
      // Pobierz drużyny z tej ligi
      fetch(`/api/league/${league}/teams`)
        .then((res) => res.json())
        .then((data) => setTeams(data))
        .catch((err) => console.error("Błąd pobierania drużyn:", err));
    }
  }, [searchParams]);

  const handleGenerateSchedule = async () => {
    if (!leagueId) {
      alert("Proszę wybrać ligę!");
      return;
    }

    if (window.confirm("Czy na pewno chcesz wygenerować kompletny terminarz dla tej ligi? Istniejące mecze zostaną zastąpione.")) {
      try {
        const response = await fetch(`/api/matches/league/${leagueId}/generate-schedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.json();
          alert(`${result.message}\nLiczba meczów: ${result.total_matches}\nLiczba kolejek: ${result.total_rounds}`);
          navigate(`/league/${leagueId}/matches`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (homeTeamId === awayTeamId) {
      alert("Drużyna nie może grać sama ze sobą!");
      return;
    }

    const matchData = {
      home_team_id: parseInt(homeTeamId),
      away_team_id: parseInt(awayTeamId),
      league_id: parseInt(leagueId),
      match_date: new Date(matchDate).toISOString(),
      round_number: parseInt(roundNumber),
    };

    try {
      const response = await fetch("/api/matches/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matchData),
      });

      if (response.ok) {
        alert("Mecz dodany pomyślnie!");
        navigate(`/league/${leagueId}/matches`);
      } else {
        const error = await response.json();
        alert(`Błąd: ${error.detail}`);
      }
    } catch (err) {
      console.error("Błąd:", err);
      alert("Wystąpił błąd podczas dodawania meczu.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>Dodaj mecz do terminarza</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>ID Ligi:</label>
          <input
            type="number"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label>Drużyna gospodarzy:</label>
          <select
            value={homeTeamId}
            onChange={(e) => setHomeTeamId(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">-- wybierz drużynę --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Drużyna gości:</label>
          <select
            value={awayTeamId}
            onChange={(e) => setAwayTeamId(e.target.value)}
            required
            style={inputStyle}
          >
            <option value="">-- wybierz drużynę --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Data i godzina meczu:</label>
          <input
            type="datetime-local"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label>Numer kolejki:</label>
          <input
            type="number"
            value={roundNumber}
            onChange={(e) => setRoundNumber(e.target.value)}
            min="1"
            required
            style={inputStyle}
          />
        </div>

        <button type="submit" style={buttonStyle}>
          Dodaj mecz
        </button>
        
        <button 
          type="button" 
          onClick={handleGenerateSchedule}
          style={{ ...buttonStyle, backgroundColor: "#ff9800", marginTop: "10px" }}
        >
          🗓️ Zaproponuj kompletny terminarz
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "8px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px"
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
