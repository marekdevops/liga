import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LeagueForm() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/leagues/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, country }),
    });

    if (response.ok) {
      alert("Liga dodana pomyślnie!");
      navigate("/"); // wróć do listy lig
    } else {
      alert("Błąd podczas dodawania ligi.");
    }
  };

  return (
    <div>
      <h2>Dodaj nową ligę</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nazwa ligi:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Kraj:</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        <button type="submit">Dodaj ligę</button>
      </form>
    </div>
  );
}
