import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Views
import PublicHome from "./views/PublicHome";
import LeagueList from "./views/public/LeagueList";
import LeagueDetails from "./views/public/LeagueDetails";
import LeagueTeams from "./views/public/LeagueTeams";
import LeagueMatches from "./views/public/LeagueMatches";
import TeamDetails from "./pages/TeamDetails";

// Admin Views
import AdminPanel from "./views/AdminPanel";
import LeagueForm from "./views/admin/LeagueForm";
import TeamForm from "./views/admin/TeamForm";
import PlayerForm from "./views/admin/PlayerForm";
import MatchForm from "./views/admin/MatchForm";
import MatchResultForm from "./views/admin/MatchResultForm";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/league" element={<LeagueList />} />
          <Route path="/league/:leagueId" element={<LeagueDetails />} />
          <Route path="/league/:leagueId/teams" element={<LeagueTeams />} />
          <Route path="/league/:leagueId/matches" element={<LeagueMatches />} />
          <Route path="/team/:id" element={<TeamDetails />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin/leagues/new" element={
            <ProtectedRoute>
              <LeagueForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/teams/new" element={
            <ProtectedRoute>
              <TeamForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/players/new" element={
            <ProtectedRoute>
              <PlayerForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/matches/new" element={
            <ProtectedRoute>
              <MatchForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/matches/:matchId/result" element={
            <ProtectedRoute>
              <MatchResultForm />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
