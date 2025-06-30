import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MatchResultForm() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  // Stan podstawowy
  const [match, setMatch] = useState(null);
  const [teams, setTeams] = useState({});
  const [homeGoals, setHomeGoals] = useState("");
  const [awayGoals, setAwayGoals] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Stan zawodników i statystyk
  const [playersData, setPlayersData] = useState(null);
  const [playerStats, setPlayerStats] = useState({});
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [matchSaved, setMatchSaved] = useState(false);
  
  // Stan dla dodawania nowych zawodników
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(null); // 'home' lub 'away'
  const [newPlayerData, setNewPlayerData] = useState({
    firstName: '',
    lastName: '',
    shirtNumber: ''
  });

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
        }

        // Pobierz zawodników obu drużyn
        const playersResponse = await fetch(`/matches/${matchId}/players`);
        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          setPlayersData(playersData);
          
          // Zainicjuj stan statystyk zawodników
          const initialStats = {};
          [...playersData.home_team.players, ...playersData.away_team.players].forEach(player => {
            initialStats[player.id] = {
              was_present: player.was_present,
              goals: player.goals,
              assists: player.assists,
              goal_minute: player.goal_minute
            };
          });
          setPlayerStats(initialStats);
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

  const updatePlayerStat = (playerId, field, value) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }));
  };

  const incrementStat = (playerId, field) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: Math.max(0, (prev[playerId][field] || 0) + 1)
      }
    }));
  };

  const decrementStat = (playerId, field) => {
    setPlayerStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: Math.max(0, (prev[playerId][field] || 0) - 1)
      }
    }));
  };

  const addNewPlayer = async (teamId, teamType) => {
    if (!newPlayerData.firstName || !newPlayerData.lastName || !newPlayerData.shirtNumber) {
      alert("Wszystkie pola są wymagane");
      return;
    }

    try {
      const response = await fetch("/players/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: newPlayerData.firstName,
          last_name: newPlayerData.lastName,
          shirt_number: parseInt(newPlayerData.shirtNumber),
          team_id: teamId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Błąd tworzenia zawodnika");
      }

      const newPlayer = await response.json();
      
      // Dodaj nowego zawodnika do listy
      setPlayersData(prev => ({
        ...prev,
        [teamType === 'home' ? 'home_team' : 'away_team']: {
          ...prev[teamType === 'home' ? 'home_team' : 'away_team'],
          players: [...prev[teamType === 'home' ? 'home_team' : 'away_team'].players, {
            id: newPlayer.id,
            first_name: newPlayer.first_name,
            last_name: newPlayer.last_name,
            shirt_number: newPlayer.shirt_number
          }].sort((a, b) => a.shirt_number - b.shirt_number)
        }
      }));

      // Zainicjuj statystyki dla nowego zawodnika
      setPlayerStats(prev => ({
        ...prev,
        [newPlayer.id]: {
          was_present: false,
          goals: 0,
          assists: 0,
          goal_minute: ''
        }
      }));

      // Resetuj formularz
      setNewPlayerData({ firstName: '', lastName: '', shirtNumber: '' });
      setShowAddPlayerForm(null);
      
      alert(`Zawodnik ${newPlayer.first_name} ${newPlayer.last_name} został dodany!`);
    } catch (err) {
      alert("Błąd dodawania zawodnika: " + err.message);
    }
  };

  const generatePDF = async () => {
    if (!matchSaved) {
      alert("Najpierw zapisz wynik meczu!");
      return;
    }

    try {
      const response = await fetch(`/matches/${matchId}/pdf-report`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error("Błąd generowania raportu");
      }

      // Pobierz PDF jako blob
      const blob = await response.blob();
      
      // Stwórz link do pobrania
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `raport_mecz_${matchId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert("Raport PDF został pobrany!");
    } catch (err) {
      alert("Błąd generowania PDF: " + err.message);
    }
  };

  const validateAndSubmit = async (e) => {
    e.preventDefault();

    if (homeGoals === "" || awayGoals === "") {
      alert("Proszę wprowadzić wyniki dla obu drużyn.");
      return;
    }

    const homeGoalsNum = parseInt(homeGoals);
    const awayGoalsNum = parseInt(awayGoals);

    if (!showPlayerStats) {
      // Zapisz tylko wynik meczu (stary sposób)
      const resultData = {
        home_goals: homeGoalsNum,
        away_goals: awayGoalsNum,
      };

      try {
        const response = await fetch(`/matches/${matchId}/result`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resultData),
        });

        if (response.ok) {
          alert("Wynik meczu został zapisany!");
          setMatchSaved(true);
        } else {
          const error = await response.json();
          alert(`Błąd: ${error.detail}`);
        }
      } catch (err) {
        console.error("Błąd:", err);
        alert("Wystąpił błąd podczas zapisywania wyniku.");
      }
      return;
    }

    // Walidacja i zapisanie z statystykami zawodników
    if (!playersData) {
      alert("Nie załadowano danych zawodników");
      return;
    }

    // Przygotuj dane statystyk zawodników
    const playerStatsArray = [];
    let homeTeamGoals = 0;
    let awayTeamGoals = 0;
    let totalAssists = 0;

    // Policz bramki z drużyny gospodarzy
    playersData.home_team.players.forEach(player => {
      const stats = playerStats[player.id] || {};
      homeTeamGoals += stats.goals || 0;
      totalAssists += stats.assists || 0;
      
      if (stats.was_present || stats.goals > 0 || stats.assists > 0) {
        playerStatsArray.push({
          match_id: parseInt(matchId),
          player_id: player.id,
          was_present: stats.was_present || false,
          goals: stats.goals || 0,
          assists: stats.assists || 0,
          goal_minute: stats.goal_minute || ""
        });
      }
    });

    // Policz bramki z drużyny gości
    playersData.away_team.players.forEach(player => {
      const stats = playerStats[player.id] || {};
      awayTeamGoals += stats.goals || 0;
      totalAssists += stats.assists || 0;
      
      if (stats.was_present || stats.goals > 0 || stats.assists > 0) {
        playerStatsArray.push({
          match_id: parseInt(matchId),
          player_id: player.id,
          was_present: stats.was_present || false,
          goals: stats.goals || 0,
          assists: stats.assists || 0,
          goal_minute: stats.goal_minute || ""
        });
      }
    });

    // Walidacja bramek
    if (homeTeamGoals !== homeGoalsNum) {
      alert(`Błąd: Drużyna gospodarzy ma ${homeGoalsNum} bramek w wyniku, ale ${homeTeamGoals} w statystykach zawodników`);
      return;
    }

    if (awayTeamGoals !== awayGoalsNum) {
      alert(`Błąd: Drużyna gości ma ${awayGoalsNum} bramek w wyniku, ale ${awayTeamGoals} w statystykach zawodników`);
      return;
    }

    // Walidacja asyst
    const totalGoals = homeGoalsNum + awayGoalsNum;
    if (totalAssists > totalGoals) {
      alert(`Błąd: Zbyt wiele asyst (${totalAssists}) w stosunku do bramek (${totalGoals})`);
      return;
    }

    const resultWithStatsData = {
      home_goals: homeGoalsNum,
      away_goals: awayGoalsNum,
      player_stats: playerStatsArray
    };

    try {
      const response = await fetch(`/matches/${matchId}/result-with-stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultWithStatsData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Wynik meczu i statystyki zostały zapisane!\n${result.message}`);
        setMatchSaved(true);
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

  const renderPlayerRow = (player, teamType) => {
    const stats = playerStats[player.id] || {};
    const teamColor = teamType === 'home' ? '#4CAF50' : '#FF9800';
    
    return (
      <tr key={player.id} style={{ borderBottom: '1px solid #444' }}>
        <td style={{ padding: '10px', color: '#ffffff' }}>
          #{player.shirt_number}
        </td>
        <td style={{ padding: '10px', color: '#ffffff' }}>
          {player.first_name} {player.last_name}
        </td>
        <td style={{ padding: '10px', textAlign: 'center' }}>
          <input
            type="checkbox"
            checked={stats.was_present || false}
            onChange={(e) => updatePlayerStat(player.id, 'was_present', e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
        </td>
        <td style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => decrementStat(player.id, 'goals')}
              style={{ ...statButtonStyle, backgroundColor: '#d32f2f' }}
            >
              -
            </button>
            <span style={{ minWidth: '30px', textAlign: 'center', color: '#ffffff', fontWeight: 'bold' }}>
              {stats.goals || 0}
            </span>
            <button
              type="button"
              onClick={() => incrementStat(player.id, 'goals')}
              style={{ ...statButtonStyle, backgroundColor: '#4caf50' }}
            >
              +
            </button>
          </div>
        </td>
        <td style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => decrementStat(player.id, 'assists')}
              style={{ ...statButtonStyle, backgroundColor: '#d32f2f' }}
            >
              -
            </button>
            <span style={{ minWidth: '30px', textAlign: 'center', color: '#ffffff', fontWeight: 'bold' }}>
              {stats.assists || 0}
            </span>
            <button
              type="button"
              onClick={() => incrementStat(player.id, 'assists')}
              style={{ ...statButtonStyle, backgroundColor: '#4caf50' }}
            >
              +
            </button>
          </div>
        </td>
        <td style={{ padding: '10px' }}>
          <input
            type="text"
            value={stats.goal_minute || ''}
            onChange={(e) => updatePlayerStat(player.id, 'goal_minute', e.target.value)}
            placeholder="np. 45, 78"
            style={{
              padding: '5px',
              border: '1px solid #555',
              borderRadius: '4px',
              backgroundColor: '#333',
              color: '#ffffff',
              width: '100px'
            }}
          />
        </td>
      </tr>
    );
  };

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1200px", 
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
      
      {/* Informacje o meczu */}
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

      <form onSubmit={validateAndSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Wynik meczu */}
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

        {/* Przełącznik statystyk zawodników */}
        <div style={{
          backgroundColor: "#2a2a2a",
          padding: "15px",
          borderRadius: "10px",
          border: "1px solid #555",
          textAlign: "center"
        }}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
            fontSize: "16px"
          }}>
            <input
              type="checkbox"
              checked={showPlayerStats}
              onChange={(e) => setShowPlayerStats(e.target.checked)}
              style={{ transform: 'scale(1.3)' }}
            />
            📊 Dodaj statystyki zawodników
          </label>
        </div>

        {/* Tabele zawodników */}
        {showPlayerStats && playersData && (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ color: "#4CAF50", textAlign: "center", marginBottom: "20px" }}>
              📋 Statystyki zawodników
            </h3>
            
            {/* Drużyna gospodarzy */}
            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ 
                color: "#4CAF50", 
                marginBottom: "15px",
                backgroundColor: "#2a2a2a",
                padding: "10px",
                borderRadius: "5px",
                textAlign: "center",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>🏠 {teams[match?.home_team_id]} (Gospodarze)</span>
                <button
                  type="button"
                  onClick={() => setShowAddPlayerForm(showAddPlayerForm === 'home' ? null : 'home')}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "8px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  {showAddPlayerForm === 'home' ? '❌ Anuluj' : '➕ Dodaj zawodnika'}
                </button>
              </h4>
              
              {/* Formularz dodawania zawodnika */}
              {showAddPlayerForm === 'home' && (
                <div style={{
                  backgroundColor: "#2a2a2a",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "8px",
                  border: "2px solid #4CAF50"
                }}>
                  <h5 style={{ color: "#4CAF50", marginBottom: "15px" }}>Dodaj nowego zawodnika do drużyny gospodarzy</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px auto", gap: "10px", alignItems: "end" }}>
                    <input
                      type="text"
                      placeholder="Imię"
                      value={newPlayerData.firstName}
                      onChange={(e) => setNewPlayerData(prev => ({ ...prev, firstName: e.target.value }))}
                      style={{
                        padding: "8px",
                        border: "1px solid #555",
                        borderRadius: "4px",
                        backgroundColor: "#333",
                        color: "#ffffff"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Nazwisko"
                      value={newPlayerData.lastName}
                      onChange={(e) => setNewPlayerData(prev => ({ ...prev, lastName: e.target.value }))}
                      style={{
                        padding: "8px",
                        border: "1px solid #555",
                        borderRadius: "4px",
                        backgroundColor: "#333",
                        color: "#ffffff"
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Nr"
                      value={newPlayerData.shirtNumber}
                      onChange={(e) => setNewPlayerData(prev => ({ ...prev, shirtNumber: e.target.value }))}
                      min="1"
                      max="99"
                      style={{
                        padding: "8px",
                        border: "1px solid #555",
                        borderRadius: "4px",
                        backgroundColor: "#333",
                        color: "#ffffff"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addNewPlayer(match?.home_team_id, 'home')}
                      style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Dodaj
                    </button>
                  </div>
                </div>
              )}
              
              <div style={{ overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  backgroundColor: "#333", 
                  borderRadius: "8px",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#4CAF50" }}>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Nr</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Zawodnik</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Obecność</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Bramki</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Asysty</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Minuty bramek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersData.home_team.players.map(player => 
                      renderPlayerRow(player, 'home')
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Drużyna gości */}
            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ 
                color: "#FF9800", 
                marginBottom: "15px",
                backgroundColor: "#2a2a2a",
                padding: "10px",
                borderRadius: "5px",
                textAlign: "center",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>🚌 {teams[match?.away_team_id]} (Goście)</span>
                <button
                  type="button"
                  onClick={() => setShowAddPlayerForm(showAddPlayerForm === 'away' ? null : 'away')}
                  style={{
                    backgroundColor: "#FF9800",
                    color: "white",
                    border: "none",
                    padding: "8px 15px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  {showAddPlayerForm === 'away' ? '❌ Anuluj' : '➕ Dodaj zawodnika'}
                </button>
              </h4>
              
              {/* Formularz dodawania zawodnika */}
              {showAddPlayerForm === 'away' && (
                <div style={{
                  backgroundColor: "#2a2a2a",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "8px",
                  border: "2px solid #FF9800"
                }}>
                  <h5 style={{ color: "#FF9800", marginBottom: "15px" }}>Dodaj nowego zawodnika do drużyny gości</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px auto", gap: "10px", alignItems: "end" }}>
                    <input
                      type="text"
                      placeholder="Imię"
                      value={newPlayerData.firstName}
                      onChange={(e) => setNewPlayerData(prev => ({ ...prev, firstName: e.target.value }))}
                      style={{
                        padding: "8px",
                        border: "1px solid #555",
                        borderRadius: "4px",
                        backgroundColor: "#333",
                        color: "#ffffff"
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Nazwisko"
                      value={newPlayerData.lastName}
                      onChange={(e) => setNewPlayerData(prev => ({ ...prev, lastName: e.target.value }))}
                      style={{
                        padding: "8px",
                        border: "1px solid #555",
                        borderRadius: "4px",
                        backgroundColor: "#333",
                        color: "#ffffff"
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Nr"
                      value={newPlayerData.shirtNumber}
                      onChange={(e) => setNewPlayerData(prev => ({ ...prev, shirtNumber: e.target.value }))}
                      min="1"
                      max="99"
                      style={{
                        padding: "8px",
                        border: "1px solid #555",
                        borderRadius: "4px",
                        backgroundColor: "#333",
                        color: "#ffffff"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addNewPlayer(match?.away_team_id, 'away')}
                      style={{
                        backgroundColor: "#FF9800",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Dodaj
                    </button>
                  </div>
                </div>
              )}
              
              <div style={{ overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  backgroundColor: "#333", 
                  borderRadius: "8px",
                  borderCollapse: "collapse"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#FF9800" }}>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Nr</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Zawodnik</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Obecność</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Bramki</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Asysty</th>
                      <th style={{ padding: "12px", color: "#ffffff" }}>Minuty bramek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersData.away_team.players.map(player => 
                      renderPlayerRow(player, 'away')
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Przyciski */}
        <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "20px" }}>
          <button type="submit" style={buttonStyle}>
            ✅ Zapisz wynik{showPlayerStats ? " i statystyki" : ""}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            style={{ ...buttonStyle, backgroundColor: "#6c757d" }}
          >
            ❌ Anuluj
          </button>
          {matchSaved && (
            <button 
              type="button" 
              style={{ ...buttonStyle, backgroundColor: "#2196F3" }}
              onClick={generatePDF}
            >
              📄 Wygeneruj raport meczowy
            </button>
          )}
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

const statButtonStyle = {
  padding: "5px 10px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
  color: "white",
  minWidth: "30px"
};
