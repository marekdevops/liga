import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import LeagueList from "./views/public/LeagueList";
import LeagueForm from "./views/admin/LeagueForm";
import TeamForm from "./views/admin/TeamForm";
import PlayerForm from "./views/admin/PlayerForm";
import LeagueDetails from "./views/public/LeagueDetails"; // jeśli placeholder już istnieje
import LeagueTeams from "./views/public/LeagueTeams";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leagues" element={<LeagueList />} />
        <Route path="/league/:leagueId" element={<LeagueDetails />} />
        <Route path="/admin/leagues/new" element={<LeagueForm />} />
        <Route path="/admin/teams/new" element={<TeamForm />} />
        <Route path="/admin/players/new" element={<PlayerForm />} />
        <Route path="/league/:leagueId/teams" element={<LeagueTeams />} />
      </Routes>
    </Router>
  );
}

export default App;
