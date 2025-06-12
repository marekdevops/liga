import { useParams } from "react-router-dom";

export default function LeagueDetails() {
  const { leagueId } = useParams();

  return (
    <div>
      <h2>Szczegóły ligi</h2>
      <p>ID ligi: {leagueId}</p>
      <p>Tu w przyszłości pojawi się tabela, terminarz i statystyki.</p>
    </div>
  );
}
