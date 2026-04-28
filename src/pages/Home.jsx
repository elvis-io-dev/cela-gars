import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Users, Compass, Star, MapPin, RefreshCw, Zap, Eye, EyeOff, Lightbulb, Menu } from 'lucide-react'
import BlobBackground from '../components/BlobBackground'
import EventCard from '../components/EventCard'
import { fetchWeekendEvents } from '../services/gemini'
import { useApp } from '../context/AppContext'
import { getSeasonLabel } from '../utils/seasonal'

export default function Home() {
  const navigate = useNavigate()
  const { guestMode, toggleGuestMode, openDrawer } = useApp()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Labrīt' : hour < 18 ? 'Labdien' : 'Labvakar'
  const seasonLabel = getSeasonLabel()

  const [events, setEvents]         = useState([])
  const [evtLoading, setEvtLoading] = useState(true)
  const [evtError,   setEvtError]   = useState(false)

  const loadEvents = () => {
    setEvtLoading(true)
    setEvtError(false)
    fetchWeekendEvents()
      .then((data) => { setEvents(data); setEvtError(data.length === 0) })
      .catch(() => setEvtError(true))
      .finally(() => setEvtLoading(false))
  }

  useEffect(() => { loadEvents() }, [])

  return (
    <div className="relative flex flex-col min-h-dvh" style={{ zIndex: 0 }}>
      <BlobBackground />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-3">
        <div>
          <p className="text-gray-400 text-sm font-medium">{greeting}!</p>
          <h1 className="font-extrabold text-3xl tracking-tight mt-0.5">
            <span className="text-gradient">Ceļa Gars</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Guest mode toggle */}
          <button
            onClick={toggleGuestMode}
            className="w-10 h-10 flex items-center justify-center rounded-2xl active:scale-90 transition-all"
            style={{
              background: guestMode ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.75)',
              border: guestMode ? '1px solid rgba(249,115,22,0.35)' : '1px solid rgba(255,255,255,0.90)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
            aria-label={guestMode ? 'Izslēgt viešu režīmu' : 'Ieslēgt viešu režīmu'}
            title={guestMode ? 'Rādīt viņai: IESLĒGTS' : 'Rādīt viņai: izslēgts'}
          >
            {guestMode
              ? <Eye size={17} className="text-orange-500" />
              : <EyeOff size={17} className="text-gray-400" />
            }
          </button>
          {/* Hamburger menu */}
          <button
            onClick={openDrawer}
            className="w-10 h-10 flex items-center justify-center rounded-2xl active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.90)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            aria-label="Navigācija"
          >
            <Menu size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Guest mode banner */}
      {guestMode && (
        <div className="relative z-10 mx-5 mb-3 rounded-2xl px-4 py-2.5 flex items-center gap-2"
          style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.25)' }}>
          <Eye size={14} className="text-orange-500 shrink-0" />
          <p className="text-xs font-semibold text-orange-600">Viešu režīms — "Rādīt viņai" aktīvs</p>
          <button onClick={toggleGuestMode} className="ml-auto text-[10px] text-orange-400 font-medium">
            Izslēgt
          </button>
        </div>
      )}

      {/* Season badge + tagline */}
      <div className="relative z-10 px-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
            {seasonLabel}
          </span>
        </div>
        {!guestMode && (
          <p className="text-gray-500 text-sm leading-relaxed">
            Atklāj Latviju — plāno svētku dienas, piedzīvojumus un braucienus.
          </p>
        )}
      </div>

      {/* ── Main action cards ── */}
      <div className="relative z-10 px-5 flex flex-col gap-4">
        {/* Date Planner */}
        <button
          onClick={() => navigate('/date-planner')}
          className="group relative overflow-hidden rounded-3xl p-5 text-left active:scale-[0.98] transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg,rgba(249,115,22,0.14) 0%,rgba(251,191,36,0.08) 100%)',
            border: '1px solid rgba(249,115,22,0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(249,115,22,0.12)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle,#F97316,transparent 70%)' }} />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <Heart size={22} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-lg">Randiņa plānotājs</h2>
              <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                Pirmais randiņš vai romantisks vakars — izveido perfektu maršrutu diviem.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 relative z-10">
            {['🕯️','🌹','🍷','🎭','🌅'].map((e,i) => <span key={i} className="text-base">{e}</span>)}
            <span className="ml-1 text-xs text-gray-400">& vairāk</span>
          </div>
        </button>

        {/* Activity Planner */}
        <button
          onClick={() => navigate('/activity-planner')}
          className="group relative overflow-hidden rounded-3xl p-5 text-left active:scale-[0.98] transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.70)',
            border: '1px solid rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle,#A855F7,transparent 70%)' }} />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.20)' }}>
              <Users size={22} className="text-purple-500" />
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-lg">Aktivitāšu plānotājs</h2>
              <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                Draugi, ģimene vai solo — atrod ko darīt Latvijā šodien.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 relative z-10">
            {['🏕️','🚵','🎨','🏄','🎪'].map((e,i) => <span key={i} className="text-base">{e}</span>)}
            <span className="ml-1 text-xs text-gray-400">& vairāk</span>
          </div>
        </button>
      </div>

      {/* ── Stats (hidden in guest mode) ── */}
      {!guestMode && (
        <div className="relative z-10 grid grid-cols-3 gap-3 px-5 mt-5">
          {[
            { icon: <MapPin size={15} />, label: 'Vietas',   value: '240+' },
            { icon: <Star   size={15} />, label: 'Maršruti', value: '80+' },
            { icon: <Compass size={15}/>, label: 'Novadi',   value: '9' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-3 text-center">
              <div className="text-orange-500 flex justify-center mb-1">{s.icon}</div>
              <div className="text-gray-900 font-bold text-base">{s.value}</div>
              <div className="text-gray-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Submit date idea (hidden in guest mode) ── */}
      {!guestMode && (
        <div className="relative z-10 px-5 mt-5">
          <button
            onClick={() => navigate('/submit-idea')}
            className="w-full glass p-4 flex items-center gap-3 active:scale-[0.98] transition-all rounded-2xl"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg"
              style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.20)' }}>
              <Lightbulb size={17} className="text-purple-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800">Iesniegt randiņa ideju</p>
              <p className="text-xs text-gray-400">Laimē Laima šokolādi vai premium abonementu 🏆</p>
            </div>
            <span className="text-orange-500 text-lg">→</span>
          </button>
        </div>
      )}

      {/* ── Gemini live events ── */}
      <div className="relative z-10 px-5 mt-6 mb-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="section-label mb-0">Šonedēļ Latvijā</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap size={11} className="text-orange-400" />
              <span className="text-[10px] text-gray-400 font-medium">Powered by Gemini + Google Search</span>
            </div>
          </div>
          <button
            onClick={loadEvents}
            disabled={evtLoading}
            className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(209,213,219,0.5)' }}
            aria-label="Atjaunot notikumus"
          >
            <RefreshCw size={13} className={`text-gray-400 ${evtLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {evtLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {[0,1,2].map((i) => <div key={i} className="skeleton h-28 w-56 rounded-2xl shrink-0" />)}
          </div>
        ) : evtError ? (
          <div className="glass p-4 text-center">
            <p className="text-sm text-gray-400">Neizdevās ielādēt notikumus.</p>
            <button onClick={loadEvents} className="text-xs text-orange-500 mt-1 font-medium">Mēģināt vēlreiz</button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
            {events.map((ev, i) => <EventCard key={i} event={ev} compact />)}
          </div>
        )}
      </div>
    </div>
  )
}
