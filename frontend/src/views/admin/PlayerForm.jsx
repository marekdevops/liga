import { useState, useEffect } from "react";

function PlayerForm() {
  // Stan kroku w procesie dodawania zawodnika
  const [step, setStep] = useState(1); // 1: wybór ligi, 2: wybór drużyny, 3: formularz zawodnika
  
  // Dane formularza zawodnika
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [number, setNumber] = useState("");
  
  // Wybrane elementy
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Listy danych
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Stan ładowania i błędów
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pobierz ligi przy załadowaniu komponentu
  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const response = await fetch("/league/");
      if (!response.ok) throw new Error("Błąd pobierania lig");
      const data = await response.json();
      setLeagues(data);
    } catch (err) {
      setError("Błąd pobierania lig: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsForLeague = async (leagueId) => {
    try {
      setLoading(true);
      const response = await fetch(`/league/${leagueId}/teams`);
      if (!response.ok) throw new Error("Błąd pobierania drużyn");
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError("Błąd pobierania drużyn: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueSelect = async (league) => {
    setSelectedLeague(league);
    setError("");
    await fetchTeamsForLeague(league.id);
    setStep(2);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTeam) {
      setError("Nie wybrano drużyny");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/players/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          shirt_number: parseInt(number),
          team_id: selectedTeam.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Błąd tworzenia zawodnika");
      }

      alert(`Zawodnik ${firstName} ${lastName} został dodany do drużyny ${selectedTeam.name}!`);
      
      // Reset formularza
      setFirstName("");
      setLastName("");
      setNumber("");
      setStep(1);
      setSelectedLeague(null);
      setSelectedTeam(null);
      setTeams([]);
      
    } catch (err) {
      setError("Błąd tworzenia zawodnika: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedLeague(null);
      setTeams([]);
    } else if (step === 3) {
      setStep(2);
      setSelectedTeam(null);
    }
    setError("");
  };

  if (loading) {
    return (
      <div className="player-form-container">
        <div className="loading">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="player-form-container">
      <div className="player-form-header">
        <h2>Dodaj zawodnika</h2>
        {step > 1 && (
          <button className="back-button" onClick={goBack}>
            ← Wstecz
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Krok 1: Wybór ligi */}
      {step === 1 && (
        <div className="step-container">
          <h3>Krok 1: Wybierz ligę</h3>
          <div className="leagues-grid">
            {leagues.map((league) => (
              <div
                key={league.id}
                className="league-card"
                onClick={() => handleLeagueSelect(league)}
              >
                <h4>{league.name}</h4>
                <p>ID: {league.id}</p>
              </div>
            ))}
          </div>
          {leagues.length === 0 && (
            <div className="no-data">Brak dostępnych lig</div>
          )}
        </div>
      )}

      {/* Krok 2: Wybór drużyny */}
      {step === 2 && selectedLeague && (
        <div className="step-container">
          <h3>Krok 2: Wybierz drużynę z ligi "{selectedLeague.name}"</h3>
          <div className="teams-grid">
            {teams.map((team) => (
              <div
                key={team.id}
                className="team-card"
                onClick={() => handleTeamSelect(team)}
              >
                <h4>{team.name}</h4>
                <p>ID: {team.id}</p>
              </div>
            ))}
          </div>
          {teams.length === 0 && (
            <div className="no-data">Brak drużyn w tej lidze</div>
          )}
        </div>
      )}

      {/* Krok 3: Formularz zawodnika */}
      {step === 3 && selectedTeam && (
        <div className="step-container">
          <h3>Krok 3: Dodaj zawodnika do drużyny "{selectedTeam.name}"</h3>
          <div className="selected-info">
            <p><strong>Liga:</strong> {selectedLeague.name}</p>
            <p><strong>Drużyna:</strong> {selectedTeam.name}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="player-form">
            <div className="form-group">
              <label htmlFor="firstName">Imię:</label>
              <input
                id="firstName"
                type="text"
                placeholder="Imię zawodnika"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Nazwisko:</label>
              <input
                id="lastName"
                type="text"
                placeholder="Nazwisko zawodnika"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="number">Numer koszulki:</label>
              <input
                id="number"
                type="number"
                placeholder="Numer (1-99)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                min="1"
                max="99"
                required
              />
            </div>
            
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Zapisywanie..." : "Dodaj zawodnika"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PlayerForm;
