import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LeagueForm() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/league/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      alert("Liga dodana pomyślnie!");
      navigate("/");
    } else {
      alert("Błąd podczas dodawania ligi.");
    }
  };

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#1a1a1a", 
      color: "#ffffff", 
      minHeight: "100vh" 
    }}>
      <h2 style={{ color: "#4CAF50", marginBottom: "20px" }}>Dodaj nową ligę</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "5px", 
            color: "#ffffff",
            fontSize: "16px"
          }}>
            Nazwa ligi:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px 12px",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "4px",
              color: "#ffffff",
              fontSize: "16px"
            }}
          />
        </div>
        <button 
          type="submit"
          style={{
            backgroundColor: "#4CAF50",
            color: "#ffffff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Dodaj ligę
        </button>
      </form>
    </div>
  );
}
