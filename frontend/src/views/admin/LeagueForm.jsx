import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LeagueForm() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/leagues/", {
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
        <button type="submit">Dodaj ligę</button>
      </form>
    </div>
  );
}
