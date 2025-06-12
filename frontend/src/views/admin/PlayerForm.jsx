import { useState } from "react";

function PlayerForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [number, setNumber] = useState("");
  const [teamId, setTeamId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/players/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          number: parseInt(number),
          team_id: parseInt(teamId),
        }),
      });

      if (!res.ok) throw new Error("Błąd tworzenia zawodnika");

      alert("Zawodnik utworzony!");
      setFirstName("");
      setLastName("");
      setNumber("");
      setTeamId("");
    } catch (err) {
      console.error(err);
      alert("Błąd");
    }
  };

  return (
    <div>
      <h2>Dodaj zawodnika</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Imię"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nazwisko"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Numer"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="ID drużyny"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          required
        />
        <button type="submit">Zapisz</button>
      </form>
    </div>
  );
}

export default PlayerForm;
