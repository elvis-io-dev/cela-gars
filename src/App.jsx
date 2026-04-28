import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import SideDrawer      from './components/SideDrawer'
import Home            from './pages/Home'
import DatePlanner     from './pages/DatePlanner'
import ActivityPlanner from './pages/ActivityPlanner'
import RouteResult     from './pages/RouteResult'
import PartnerProfile  from './pages/PartnerProfile'
import DateIdeaSubmit  from './pages/DateIdeaSubmit'
import Celabiedris     from './pages/Celabiedris'
import ManaKarte       from './pages/ManaKarte'

function AppRoutes() {
  return (
    <div className="app-shell">
      {/* Global navigation drawer — rendered once, always in the DOM */}
      <SideDrawer />

      <Routes>
        <Route path="/"                 element={<Home />} />
        <Route path="/date-planner"     element={<DatePlanner />} />
        <Route path="/activity-planner" element={<ActivityPlanner />} />
        <Route path="/route-result"     element={<RouteResult />} />
        <Route path="/partner-profile"  element={<PartnerProfile />} />
        <Route path="/submit-idea"      element={<DateIdeaSubmit />} />
        <Route path="/celabiedris"      element={<Celabiedris />} />
        <Route path="/mana-karte"       element={<ManaKarte />} />
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
