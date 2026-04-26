import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import DatePlanner from './pages/DatePlanner'
import ActivityPlanner from './pages/ActivityPlanner'
import RouteResult from './pages/RouteResult'
import PartnerProfile from './pages/PartnerProfile'

function AppRoutes() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/date-planner" element={<DatePlanner />} />
        <Route path="/activity-planner" element={<ActivityPlanner />} />
        <Route path="/route-result" element={<RouteResult />} />
        <Route path="/partner-profile" element={<PartnerProfile />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
