import { useState } from "react";

function LeagueForm() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/leagues/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, country }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Liga dodana");
        setName("");
        setCountry("");
      })
      .catch((err) => console.error("Błąd:", err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Dodaj ligę</h2>
      <input
        type="text"
        placeholder="Nazwa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Kraj"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        required
      />
      <button type="submit">Dodaj ligę</button>
    </form>
  );
}

export default LeagueForm;
