import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LeagueList from "./views/public/LeagueList";
import LeagueForm from "./views/admin/LeagueForm";
import TeamForm from "./views/admin/TeamForm";
import PlayerForm from "./views/admin/PlayerForm";
import LeagueDetails from "./views/public/LeagueDetails";
function App() {
  return (
    <Router>
      <Routes>
        {/* Widok publiczny */}
        <Route path="/" element={<LeagueList />} />

        {/* Widoki administracyjne */}
        <Route path="/admin/leagues/new" element={<LeagueForm />} />
        <Route path="/admin/teams/new" element={<TeamForm />} />
        <Route path="/admin/players/new" element={<PlayerForm />} />
        <Route path="/league/:leagueId" element={<LeagueDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
