import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import BlobBackground from '../components/BlobBackground'
import GlassCard from '../components/GlassCard'
import LocationPhoto from '../components/LocationPhoto'
import EventCard from '../components/EventCard'
import PackingList from '../components/PackingList'
import { generateRoute } from '../services/routeGenerator'
import { fetchLatviaEvents } from '../services/openai'
import { fetchRigaWeather } from '../services/weather'
import { getSeason, getSeasonalStops } from '../utils/seasonal'
import {
  getCityCoords, haversineKm,
  estimateTravelTime, getTransportLabel, getTransportIcon,
} from '../utils/geography'
import { useApp } from '../context/AppContext'
import {
  MapPin, Clock, Euro, Sun, Cloud, CloudRain, Wind,
  Droplets, Share2, RefreshCw, ChevronDown, ChevronUp,
  Zap, TrendingUp, TrendingDown, Minus, Sparkles, Navigation,
} from 'lucide-react'

/* ── Weather icon ──────────────────────────────────────────── */
const WeatherIcon = ({ condition, size = 15 }) => {
  if (condition === 'sunny') return <Sun       size={size} className="text-amber-500" />
  if (condition === 'rainy') return <CloudRain size={size} className="text-blue-400"  />
  return                            <Cloud     size={size} className="text-gray-400"  />
}

/* ── Stop card ─────────────────────────────────────────────── */
function StopCard({ stop, index, isLast }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className="relative flex gap-3">
      {!isLast && (
        <div className="absolute left-[19px] top-[52px] bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, rgba(249,115,22,0.35), transparent)' }} />
      )}

      <div className="shrink-0 pt-1 z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.25)' }}>
          {stop.icon}
        </div>
      </div>

      <div className="flex-1 mb-4 min-w-0">
        <button onClick={() => setOpen((v) => !v)} className="w-full text-left">
          <div className="glass overflow-hidden">
            {open && (
              <LocationPhoto
                placeName={stop.title}
                className="w-full h-36 rounded-t-2xl rounded-b-none"
              />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-orange-500 font-bold">{stop.time}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{stop.duration}</span>
                  </div>
                  <h3 className="text-gray-900 font-semibold text-sm leading-snug">{stop.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-orange-500">
                    {stop.cost === 0 ? 'Bezmaksas' : `€${stop.cost}`}
                  </span>
                  {open
                    ? <ChevronUp   size={14} className="text-gray-300" />
                    : <ChevronDown size={14} className="text-gray-300" />}
                </div>
              </div>

              {open && (
                <div className="mt-3 border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{stop.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stop.tags?.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{ background: 'rgba(249,115,22,0.09)', color: '#EA580C', border: '1px solid rgba(249,115,22,0.20)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

/* ── Route loading skeleton ────────────────────────────────── */
function RouteSkeleton() {
  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <p className="section-label mb-0">Maršruts</p>
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-orange-400 animate-pulse" />
          <span className="text-[10px] text-orange-400 font-medium animate-pulse">
            AI veido maršrutu...
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="skeleton w-10 h-10 rounded-xl shrink-0 mt-1" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-24 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Main component ────────────────────────────────────────── */
export default function RouteResult() {
  const navigate   = useNavigate()
  const { state }  = useLocation()
  const { guestMode } = useApp()

  const isDate  = state?.type === 'date'
  const backTo  = isDate ? '/date-planner' : '/activity-planner'
  const budget  = state?.budget ?? null
  const interests  = state?.interests ?? []
  const hasDog     = state?.hasDog    ?? false
  const season     = getSeason()

  /* ── AI-generated route ── */
  const [routeStops,   setRouteStops]   = useState([])
  const [routeLoading, setRouteLoading] = useState(true)

  /* ── Real weather ── */
  const [weather,    setWeather]    = useState(null)
  const [wxLoading,  setWxLoading]  = useState(true)

  /* ── OpenAI events ── */
  const [aiEvents,   setAiEvents]   = useState([])
  const [aiLoading,  setAiLoading]  = useState(true)

  const loadAiEvents = () => {
    setAiLoading(true)
    fetchLatviaEvents()
      .then(setAiEvents)
      .finally(() => setAiLoading(false))
  }

  const loadRoute = () => {
    setRouteLoading(true)
    generateRoute(state)
      .then((stops) => setRouteStops(stops ?? []))
      .finally(() => setRouteLoading(false))
  }

  useEffect(() => {
    loadRoute()
    loadAiEvents()
    fetchRigaWeather()
      .then(setWeather)
      .finally(() => setWxLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Derived values (computed from dynamic stops) ── */
  const totalCost  = routeStops.reduce((s, x) => s + (Number(x.cost) || 0), 0)
  const totalHrs   = routeStops.reduce((s, x) => s + (parseFloat(x.duration) || 1), 0)
  const remaining  = budget !== null ? budget - totalCost : null
  const overBudget = remaining !== null && remaining < 0

  /* ── Travel time from start to first stop ── */
  const travelInfo = (() => {
    if (routeLoading || routeStops.length === 0) return null
    const startName = state?.startLocation
    if (!startName) return null
    const firstStop   = routeStops[0]
    const destName    = firstStop.location || startName
    const startCoords = getCityCoords(startName)
    const destCoords  = getCityCoords(destName)
    const distKm      = haversineKm(startCoords.lat, startCoords.lon, destCoords.lat, destCoords.lon)
    if (distKm < 2) return null   // same area — not worth showing
    const transport   = state?.transport ?? []
    return {
      distKm:    Math.round(distKm),
      timeStr:   estimateTravelTime(distKm, transport),
      modeLabel: getTransportLabel(transport),
      modeIcon:  getTransportIcon(transport),
      destCity:  destName,
    }
  })()

  return (
    <div className="flex flex-col min-h-dvh relative">
      <BlobBackground />
      <PageHeader
        title={isDate ? 'Randiņa maršruts' : 'Aktivitāšu maršruts'}
        subtitle={(() => {
          const parts = []
          if (state?.startLocation && state.startLocation !== 'Rīga')
            parts.push(`No ${state.startLocation}`)
          if (state?.maxDistance && state.maxDistance < 200)
            parts.push(`${state.maxDistance} km`)
          if (budget !== null)
            parts.push(budget === 0 ? 'Bezmaksas' : `€${budget}`)
          return parts.length ? parts.join(' · ') : 'Šodienai sagatavots plāns'
        })()}
        backTo={backTo}
        action={
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(209,213,219,0.5)' }}
          >
            <Share2 size={15} className="text-gray-500" />
          </button>
        }
      />

      <div className="page-scroll px-5 pb-28 relative z-10">

        {/* ── Summary bar ── */}
        <div className="mt-4 mb-4 glass-orange p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {routeLoading ? (
              <div className="skeleton w-16 h-4 rounded" />
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock size={14} className="text-orange-500" />
                <span>~{totalHrs} st.</span>
              </div>
            )}

            <div className="w-px h-4 shrink-0" style={{ background: 'rgba(0,0,0,0.10)' }} />

            {routeLoading ? (
              <div className="skeleton w-12 h-4 rounded" />
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Euro size={14} className="text-orange-500" />
                <span className={overBudget ? 'text-red-500 font-semibold' : ''}>
                  €{totalCost}
                </span>
                {budget !== null && !overBudget && (
                  <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full">
                    ≤ €{budget} ✓
                  </span>
                )}
              </div>
            )}

            <div className="w-px h-4 shrink-0" style={{ background: 'rgba(0,0,0,0.10)' }} />

            {wxLoading ? (
              <div className="skeleton w-16 h-4 rounded" />
            ) : weather ? (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <WeatherIcon condition={weather.condition} />
                <span>{weather.temp}°C</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Cloud size={14} /><span>Rīga</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
            <MapPin size={11} />
            {routeLoading
              ? <div className="skeleton w-14 h-3 rounded" />
              : <span>{routeStops.length} pieturas</span>
            }
          </div>
        </div>

        {/* ── Travel time to first stop ── */}
        {travelInfo && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}>
            <span className="text-xl shrink-0">{travelInfo.modeIcon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800">
                {state?.startLocation} → {travelInfo.destCity}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {travelInfo.timeStr} {travelInfo.modeLabel} · {travelInfo.distKm} km
              </p>
            </div>
            <Navigation size={14} className="text-indigo-400 shrink-0" />
          </div>
        )}

        {/* Real weather detail card */}
        {!wxLoading && weather && (
          <GlassCard className="mb-4 flex items-center gap-4">
            <img src={weather.icon} alt={weather.description}
              className="w-12 h-12 shrink-0" style={{ imageRendering: 'crisp-edges' }} />
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-semibold text-sm capitalize">{weather.description}</p>
              <p className="text-orange-500 font-bold text-xl">{weather.temp}°C
                <span className="text-gray-400 text-xs font-normal ml-1">
                  jūtas kā {weather.feelsLike}°C
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Droplets size={11} className="text-blue-400" />{weather.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind size={11} className="text-gray-400" />{weather.windSpeed} km/h
              </span>
            </div>
          </GlassCard>
        )}

        {/* Weather warning */}
        {!wxLoading && weather?.condition === 'rainy' && (
          <GlassCard className="mb-5 flex items-start gap-3">
            <span className="text-xl shrink-0">☔</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">Lietus brīdinājums</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Paredzēts lietus — apsver iekštelpu alternatīvas maršrutā.
              </p>
            </div>
          </GlassCard>
        )}

        {/* ── Timeline ── */}
        {routeLoading ? (
          <RouteSkeleton />
        ) : (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="section-label mb-0">Maršruts</p>
              <button
                onClick={loadRoute}
                className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.25)' }}
                aria-label="Ģenerēt jaunu maršrutu"
                title="Ģenerēt jaunu maršrutu"
              >
                <RefreshCw size={12} className="text-orange-500" />
              </button>
            </div>
            {routeStops.map((stop, i) => (
              <StopCard key={i} stop={stop} index={i} isLast={i === routeStops.length - 1} />
            ))}
          </section>
        )}

        {/* ── Cost breakdown ── */}
        {!routeLoading && routeStops.length > 0 && (
          <section className="mb-4">
            <p className="section-label">Izmaksu kopsavilkums</p>
            <GlassCard>
              <div className="space-y-2">
                {routeStops.map((s, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{s.icon}</span>
                      <span className="truncate max-w-[180px]">{s.title}</span>
                    </div>
                    {s.cost === 0
                      ? <span className="text-xs font-semibold text-green-500">Bezmaksas</span>
                      : <span className="text-sm font-semibold text-gray-700">€{s.cost}</span>
                    }
                  </div>
                ))}
                <div className="border-t pt-2 mt-1 flex justify-between"
                  style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                  <span className="text-sm font-bold text-gray-800">Kopā</span>
                  <span className="text-sm font-extrabold text-orange-500">€{totalCost}</span>
                </div>
              </div>
            </GlassCard>
          </section>
        )}

        {/* ── Budget vs actual ── */}
        {!routeLoading && budget !== null && (
          <section className="mb-6">
            <p className="section-label">Budžets</p>
            <div className="rounded-2xl p-4"
              style={{
                background: overBudget ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)',
                border: `1px solid ${overBudget ? 'rgba(239,68,68,0.20)' : 'rgba(34,197,94,0.22)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Tavs budžets</span>
                <span className="font-bold text-gray-900">
                  {budget === 0 ? 'Bezmaksas' : `€${budget}`}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Plānotās izmaksas</span>
                <span className="font-bold text-gray-900">€{totalCost}</span>
              </div>

              {/* Progress bar — only meaningful when budget > 0 */}
              {budget > 0 && (
                <div className="h-2 rounded-full mb-3 overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (totalCost / budget) * 100).toFixed(1)}%`,
                      background: overBudget
                        ? 'linear-gradient(90deg,#F97316,#EF4444)'
                        : 'linear-gradient(90deg,#22C55E,#16A34A)',
                    }} />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {overBudget
                    ? <TrendingUp  size={14} className="text-red-500" />
                    : remaining === 0
                      ? <Minus       size={14} className="text-gray-400" />
                      : <TrendingDown size={14} className="text-green-500" />
                  }
                  <span className={`text-sm font-semibold ${overBudget ? 'text-red-500' : 'text-green-600'}`}>
                    {overBudget
                      ? `€${Math.abs(remaining)} virs budžeta`
                      : budget === 0
                        ? 'Pilnīgi bezmaksas maršruts!'
                        : `€${remaining} atlicis`
                    }
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overBudget
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-700'}`}>
                  {overBudget ? 'Pārtērēts' : 'Budžetā ✓'}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ── Packing list ── */}
        <PackingList
          weather={weather}
          isDate={isDate}
          interests={interests}
          hasDog={hasDog}
          season={season}
        />

        {/* ── Seasonal bonus stops ── */}
        {(() => {
          const bonusStops = !wxLoading ? getSeasonalStops(weather) : []
          if (bonusStops.length === 0) return null
          const seasonEmoji = { winter:'❄️', spring:'🌸', summer:'☀️', autumn:'🍂' }[season] ?? '🗓️'
          return (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <p className="section-label mb-0">Sezonālie ieteikumi</p>
                <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                  {seasonEmoji} Sezona
                </span>
              </div>
              <div className="space-y-3">
                {bonusStops.map((stop, i) => (
                  <div key={i} className="glass p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.20)' }}>
                      {stop.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-gray-900 font-semibold text-sm">{stop.title}</h3>
                        <span className="text-sm font-bold text-orange-500 shrink-0">
                          {stop.cost === 0 ? 'Bezmaksas' : `€${stop.cost}`}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{stop.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {stop.tags?.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(249,115,22,0.09)', color: '#EA580C', border: '1px solid rgba(249,115,22,0.20)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })()}

        {/* ── OpenAI live events ── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="section-label mb-0">Papildu ieteikumi</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Zap size={11} className="text-orange-400" />
                <span className="text-[10px] text-gray-400 font-medium">Powered by OpenAI Web Search</span>
              </div>
            </div>
            <button onClick={loadAiEvents} disabled={aiLoading}
              className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90"
              style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(209,213,219,0.5)' }}>
              <RefreshCw size={13} className={`text-gray-400 ${aiLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {aiLoading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {aiEvents.slice(0, 3).map((ev, i) => <EventCard key={i} event={ev} />)}
            </div>
          )}
        </section>

        {/* Tips */}
        <section className="mb-6">
          <p className="section-label">Padomi</p>
          <div className="space-y-2">
            {[
              { icon: '📱', text: 'Ielādē Google Maps bezsaistes kartes — internets ne vienmēr pieejams lauku apvidos.' },
              { icon: '💳', text: 'Lielākā daļa vietu pieņem kartes, bet ņem arī skaidru naudu tirgiem.' },
              { icon: '🅿️', text: isDate ? 'Vecrīgā bezmaksas stāvvietas pēc 21:00.' : 'Siguldā lētas stāvvietas pie stacijas.' },
            ].map((tip, i) => (
              <div key={i} className="glass p-3 flex items-start gap-3">
                <span className="text-base shrink-0">{tip.icon}</span>
                <p className="text-xs text-gray-500 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-5 z-20"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.98) 60%, transparent)' }}>
        <div className="flex gap-3">
          <button onClick={() => navigate(backTo)}
            className="btn-ghost flex items-center justify-center gap-2 flex-1">
            <RefreshCw size={16} />
            Jauns
          </button>
          <button className="btn-primary flex items-center justify-center gap-2 flex-[2]">
            <MapPin size={16} />
            Atvērt kartē
          </button>
        </div>
      </div>
    </div>
  )
}
