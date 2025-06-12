import { useState } from "react";

function TeamForm() {
  const [name, setName] = useState("");
  const [leagueId, setLeagueId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/teams/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, league_id: parseInt(leagueId) }),
      });

      if (!res.ok) throw new Error("Błąd tworzenia drużyny");

      alert("Drużyna utworzona!");
      setName("");
      setLeagueId("");
    } catch (err) {
      console.error(err);
      alert("Błąd");
    }
  };

  return (
    <div>
      <h2>Dodaj drużynę</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nazwa drużyny"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="ID ligi"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          required
        />
        <button type="submit">Zapisz</button>
      </form>
    </div>
  );
}

export default TeamForm;
