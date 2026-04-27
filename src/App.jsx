import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Home            from './pages/Home'
import DatePlanner     from './pages/DatePlanner'
import ActivityPlanner from './pages/ActivityPlanner'
import RouteResult     from './pages/RouteResult'
import PartnerProfile  from './pages/PartnerProfile'
import DateIdeaSubmit  from './pages/DateIdeaSubmit'

function AppRoutes() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/date-planner"   element={<DatePlanner />} />
        <Route path="/activity-planner" element={<ActivityPlanner />} />
        <Route path="/route-result"   element={<RouteResult />} />
        <Route path="/partner-profile" element={<PartnerProfile />} />
        <Route path="/submit-idea"    element={<DateIdeaSubmit />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
