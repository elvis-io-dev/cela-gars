import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import { MapPin, Clock, Euro, Cloud, Sun, CloudRain, Share2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

// --- Mock data generators ---
const dateRoutes = [
  {
    time: '17:00',
    duration: '45 min',
    title: 'Rīgas Centrāltirgus',
    desc: 'Sāciet ar svaigu ziedu pušķi un garšīgiem našķiem tirgu labirintos.',
    type: 'market',
    icon: '🛍️',
    cost: 12,
    tags: ['Romantisks', 'Kultūra'],
  },
  {
    time: '18:00',
    duration: '1 st.',
    title: 'Pastaigas pa Vecrīgu',
    desc: 'Mājīgas ielas, bruģakmens ceļi un paslēpti pagalmi — ideāla telpa tuvākai iepazīšanai.',
    type: 'walk',
    icon: '🏰',
    cost: 0,
    tags: ['Bezmaksas', 'Romantisks'],
  },
  {
    time: '19:15',
    duration: '1.5 st.',
    title: 'Vakariņas "Folkklubs Ata Dubults"',
    desc: 'Latvju virtuves dārgumi modernā iesaiņojumā. Reservēt galdiņu iepriekš.',
    type: 'food',
    icon: '🍽️',
    cost: 45,
    tags: ['Gastro', 'Intīms'],
  },
  {
    time: '21:00',
    duration: '1 st.',
    title: 'Vakara skats no Sv. Pētera torņa',
    desc: 'Pilsētas panorāma krēslā — neaizmirstams brīdis diviem.',
    type: 'view',
    icon: '🌆',
    cost: 9,
    tags: ['Romantisks', 'Unikāls'],
  },
]

const activityRoutes = [
  {
    time: '10:00',
    duration: '2 st.',
    title: 'Gauja nacionālais parks',
    desc: 'Latvijas lielākais nacionālais parks — meži, atsegumi un Gaujas ieleja.',
    type: 'nature',
    icon: '🌿',
    cost: 0,
    tags: ['Daba', 'Bezmaksas'],
  },
  {
    time: '12:15',
    duration: '45 min',
    title: 'Pusdienas Siguldā',
    desc: '"Aparjods" — krāsns maize, vietējā sūra un karsts zirņu zupa.',
    type: 'food',
    icon: '🍲',
    cost: 18,
    tags: ['Vietējais', 'Ēdiens'],
  },
  {
    time: '13:15',
    duration: '1.5 st.',
    title: 'Turaidas pils komplekss',
    desc: 'Viduslaiku pils ar izstādēm un skatu laukumu pār Gaujas leju.',
    type: 'history',
    icon: '🏰',
    cost: 7,
    tags: ['Vēsture', 'Kultūra'],
  },
  {
    time: '15:00',
    duration: '1 st.',
    title: 'Zipline "Tarzāns"',
    desc: 'Brauciens pāri Gaujai — adrenalīns un skaists skats.',
    type: 'sport',
    icon: '🎿',
    cost: 15,
    tags: ['Sports', 'Adrenalīns'],
  },
]

const weatherIcons = { sunny: <Sun size={16} className="text-amber-400" />, cloudy: <Cloud size={16} className="text-white/50" />, rainy: <CloudRain size={16} className="text-blue-400" /> }
const weathers = ['sunny', 'cloudy', 'rainy']
const mockWeather = weathers[Math.floor(Math.random() * weathers.length)]
const mockTemp = Math.floor(Math.random() * 15) + 8

function StopCard({ stop, index, isLast }) {
  const [expanded, setExpanded] = useState(index === 0)

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[19px] top-[52px] bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" />
      )}

      <div className="flex gap-3">
        {/* Node */}
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 z-10"
            style={{
              background: 'rgba(249,115,22,0.15)',
              border: '1px solid rgba(249,115,22,0.3)',
            }}
          >
            {stop.icon}
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 mb-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left"
          >
            <div className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-primary font-semibold">{stop.time}</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs text-white/30">{stop.duration}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-tight">{stop.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {stop.cost === 0 ? 'Bezmaksas' : `€${stop.cost}`}
                  </span>
                  {expanded
                    ? <ChevronUp size={14} className="text-white/30" />
                    : <ChevronDown size={14} className="text-white/30" />
                  }
                </div>
              </div>

              {expanded && (
                <div className="mt-3 border-t border-white/5 pt-3">
                  <p className="text-white/60 text-xs leading-relaxed mb-3">{stop.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stop.tags.map((tag) => (
                      <span key={tag} className="tag text-xs px-2 py-1">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RouteResult() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const isDate = state?.type === 'date'
  const stops = isDate ? dateRoutes : activityRoutes
  const totalCost = stops.reduce((s, x) => s + x.cost, 0)
  const totalDuration = stops.reduce((acc, s) => {
    const h = parseFloat(s.duration)
    return acc + (isNaN(h) ? 1 : h)
  }, 0)

  return (
    <div className="flex flex-col min-h-dvh">
      <PageHeader
        title={isDate ? 'Randiņa maršruts' : 'Aktivitāšu maršruts'}
        subtitle="Šodienai sagatavots plāns"
        backTo={isDate ? '/date-planner' : '/activity-planner'}
        action={
          <button className="glass w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform">
            <Share2 size={15} className="text-white/70" />
          </button>
        }
      />

      <div className="page-scroll px-5 pb-28">

        {/* Summary bar */}
        <div className="glass-orange rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-white/70">
              <Clock size={14} className="text-primary" />
              <span>~{totalDuration} st.</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5 text-sm text-white/70">
              <Euro size={14} className="text-primary" />
              <span>€{totalCost}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5 text-sm text-white/70">
              {weatherIcons[mockWeather]}
              <span>{mockTemp}°C</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <MapPin size={12} />
            <span>{stops.length} pietura</span>
          </div>
        </div>

        {/* Weather tip */}
        {mockWeather === 'rainy' && (
          <GlassCard className="mb-5 flex items-start gap-3">
            <span className="text-xl">☔</span>
            <div>
              <p className="text-sm font-medium text-white">Lietus brīdinājums</p>
              <p className="text-xs text-white/50 mt-0.5">Šodien paredzets lietus — maršrutā iekļautas iekštelpu alternatīvas.</p>
            </div>
          </GlassCard>
        )}

        {/* Timeline */}
        <section className="mb-4">
          <p className="section-label">Maršruts</p>
          <div>
            {stops.map((stop, i) => (
              <StopCard key={i} stop={stop} index={i} isLast={i === stops.length - 1} />
            ))}
          </div>
        </section>

        {/* Cost breakdown */}
        <section className="mb-6">
          <p className="section-label">Izmaksu kopsavilkums</p>
          <GlassCard>
            <div className="space-y-2">
              {stops.map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>{s.icon}</span>
                    <span className="truncate max-w-[180px]">{s.title}</span>
                  </div>
                  <span className="text-sm font-medium text-white shrink-0">
                    {s.cost === 0 ? (
                      <span className="text-green-400 text-xs">Bezmaksas</span>
                    ) : (
                      `€${s.cost}`
                    )}
                  </span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                <span className="text-sm font-semibold text-white">Kopā</span>
                <span className="text-sm font-bold text-primary">€{totalCost}</span>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Tips */}
        <section className="mb-6">
          <p className="section-label">Padomi</p>
          <div className="space-y-2">
            {[
              { icon: '📱', text: 'Ielādē Google Maps bezsaistes kartes priekš Latvijas — internets ne vienmēr pieejams.' },
              { icon: '💳', text: 'Lielākā daļa vietu pieņem kartes, bet ņem arī skaidru naudu tirgiem.' },
              { icon: '🅿️', text: isDate ? 'Vecrīgā bezmaksas stāvvietas pēc 21:00.' : 'Siguldā lētas stāvvietas pie stacijas.' },
            ].map((tip, i) => (
              <div key={i} className="glass rounded-xl p-3 flex items-start gap-3">
                <span className="text-base shrink-0">{tip.icon}</span>
                <p className="text-xs text-white/50 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom actions */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, rgba(15,10,0,0.95) 60%, transparent)' }}
      >
        <div className="flex gap-3">
          <button
            onClick={() => navigate(isDate ? '/date-planner' : '/activity-planner')}
            className="btn-ghost flex items-center gap-2 flex-1 justify-center"
          >
            <RefreshCw size={16} />
            Jauns
          </button>
          <button className="btn-primary flex items-center gap-2 flex-[2] justify-center">
            <MapPin size={16} />
            Atvērt kartē
          </button>
        </div>
      </div>
    </div>
  )
}
