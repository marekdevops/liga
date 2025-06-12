import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <h1>⚽ System Zarządzania Ligą Piłkarską</h1>
      <div className="home-links">
        <div>
          <h2>👀 Widok publiczny</h2>
          <Link to="/leagues">Zobacz dostępne ligi</Link>
        </div>
        <div>
          <h2>🛠️ Panel administracyjny</h2>
          <ul>
            <li><Link to="/admin/leagues/new">➕ Dodaj ligę</Link></li>
            <li><Link to="/admin/teams/new">➕ Dodaj drużynę</Link></li>
            <li><Link to="/admin/players/new">➕ Dodaj zawodnika</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
