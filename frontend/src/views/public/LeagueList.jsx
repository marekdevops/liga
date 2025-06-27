import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LeagueList() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    fetch("/league/")
      .then((res) => res.json())
      .then((data) => {
        console.log("ODEBRANE LIGI:", data);
        setLeagues(data);
      })
      .catch((err) => console.error("Błąd pobierania lig:", err));
  }, []);

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#1a1a1a", 
      color: "#ffffff", 
      minHeight: "100vh" 
    }}>
      <h2 style={{ color: "#4CAF50", marginBottom: "20px" }}>Dostępne ligi</h2>
      {leagues.length === 0 && (
        <p style={{ color: "#cccccc", fontSize: "16px" }}>Brak lig do wyświetlenia.</p>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {leagues.map((league) => (
          <li key={league.id} style={{ marginBottom: "15px" }}>
            <Link 
              to={`/league/${league.id}`}
              style={{
                color: "#2196F3",
                textDecoration: "none",
                fontSize: "18px",
                padding: "12px 16px",
                border: "1px solid #2196F3",
                borderRadius: "6px",
                backgroundColor: "rgba(33, 150, 243, 0.1)",
                display: "block",
                transition: "all 0.3s ease",
                hover: {
                  backgroundColor: "rgba(33, 150, 243, 0.2)"
                }
              }}
            >
              ⚽ {league.name} {league.country ? `(${league.country})` : ''}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
