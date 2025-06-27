import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import LeagueList from "./views/public/LeagueList";
import LeagueForm from "./views/admin/LeagueForm";
import TeamForm from "./views/admin/TeamForm";
import PlayerForm from "./views/admin/PlayerForm";
import MatchForm from "./views/admin/MatchForm";
import MatchResultForm from "./views/admin/MatchResultForm";
import LeagueDetails from "./views/public/LeagueDetails";
import LeagueTeams from "./views/public/LeagueTeams";
import LeagueMatches from "./views/public/LeagueMatches";
import TeamDetails from "./pages/TeamDetails";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/league" element={<LeagueList />} />
        <Route path="/league/:leagueId" element={<LeagueDetails />} />
        <Route path="/admin/leagues/new" element={<LeagueForm />} />
        <Route path="/admin/teams/new" element={<TeamForm />} />
        <Route path="/admin/players/new" element={<PlayerForm />} />
        <Route path="/admin/matches/new" element={<MatchForm />} />
        <Route path="/admin/matches/:matchId/result" element={<MatchResultForm />} />
        <Route path="/league/:leagueId/teams" element={<LeagueTeams />} />
        <Route path="/league/:leagueId/matches" element={<LeagueMatches />} />
        <Route path="/team/:id" element={<TeamDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
