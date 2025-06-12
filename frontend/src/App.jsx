import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LeagueList from "./views/public/LeagueList";
import LeagueForm from "./views/admin/LeagueForm";
import TeamForm from "./views/admin/TeamForm";
import PlayerForm from "./views/admin/PlayerForm";
import LeagueDetails from "./views/public/LeagueDetails";
import Home from "./views/Home";

function App() {
  return (
    <Router>
<Routes>
  <Route path="/" element={<Home />} /> {/* Strona startowa */}

  {/* Publiczne */}
  <Route path="/leagues" element={<LeagueList />} />
  <Route path="/league/:leagueId" element={<LeagueDetails />} />

  {/* Admin */}
  <Route path="/admin/leagues/new" element={<LeagueForm />} />
  <Route path="/admin/teams/new" element={<TeamForm />} />
  <Route path="/admin/players/new" element={<PlayerForm />} />
</Routes>
    </Router>
  );
}

export default App;
