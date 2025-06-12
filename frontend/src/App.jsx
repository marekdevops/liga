import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LeagueDetails from "./pages/LeagueDetails";
import TeamDetails from "./pages/TeamDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/league/:id" element={<LeagueDetails />} />
        <Route path="/team/:id" element={<TeamDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
