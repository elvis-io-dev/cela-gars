/**
 * Mana Karte — My Map
 *
 * Interactive Latvia map showing visited places.
 * 🟢 Loved it  🟡 It was ok  🔴 Didn't like it
 *
 * Tap a dot to see notes + photo.
 * Stored in localStorage; syncs to user profile.
 *
 * The SVG map uses a 354×200 viewport with cities projected from
 * real lat/lon coordinates:
 *   x = (lon - 21.0) / 7.2 * 354
 *   y = (57.8 - lat) / 2.2 * 200
 */
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import BlobBackground from '../components/BlobBackground'
import { Plus, X, Star, ThumbsUp, ThumbsDown, MapPin } from 'lucide-react'

/* ── City dot positions ─────────────────────────────────────────
 * Pre-computed using: x = (lon-21)/7.2*354,  y = (57.8-lat)/2.2*200
 * ──────────────────────────────────────────────────────────────── */
const CITY_DOTS = [
  { name: 'Rīga',       x: 152, y: 78,  major: true  },
  { name: 'Jūrmala',    x: 136, y: 75,  major: false },
  { name: 'Sigulda',    x: 189, y: 59,  major: false },
  { name: 'Cēsis',      x: 210, y: 44,  major: false },
  { name: 'Valmiera',   x: 218, y: 24,  major: false },
  { name: 'Liepāja',    x: 1,   y: 118, major: true  },
  { name: 'Ventspils',  x: 28,  y: 37,  major: true  },
  { name: 'Daugavpils', x: 272, y: 175, major: true  },
  { name: 'Jelgava',    x: 133, y: 104, major: false },
  { name: 'Ogre',       x: 177, y: 90,  major: false },
  { name: 'Tukums',     x: 106, y: 76,  major: false },
  { name: 'Bauska',     x: 157, y: 126, major: false },
  { name: 'Rēzekne',    x: 311, y: 117, major: true  },
  { name: 'Ķemeri',     x: 116, y: 88,  major: false },
  { name: 'Saulkrasti', x: 170, y: 51,  major: false },
  { name: 'Kuldīga',    x: 60,  y: 77,  major: false },
  { name: 'Saldus',     x: 91,  y: 103, major: false },
  { name: 'Alūksne',    x: 337, y: 24,  major: false },
]

/* ── Sample visited places (demo data) ─────────────────────────── */
const DEMO_VISITS = [
  {
    id: 1, city: 'Sigulda', title: 'Turaidas pils',
    rating: 'love', note: 'Brīnišķīgs rudens! Lapas bija dzeltenās.',
    date: '2024-10-12', x: 189, y: 59,
  },
  {
    id: 2, city: 'Jūrmala', title: 'Majori pludmale',
    rating: 'ok', note: 'Auksts, bet jauks pastaiga.',
    date: '2025-03-20', x: 136, y: 75,
  },
  {
    id: 3, city: 'Rīga', title: 'Vecrīga',
    rating: 'love', note: 'Vienmēr jauki. Rocket Bean kafija 👌',
    date: '2025-04-01', x: 152, y: 78,
  },
  {
    id: 4, city: 'Ķemeri', title: 'Kaniera ezers',
    rating: 'love', note: 'Mierīga un skaista. Ņem odu līdzekli!',
    date: '2025-04-15', x: 116, y: 88,
  },
  {
    id: 5, city: 'Daugavpils', title: 'Daugavpils cietoksnis',
    rating: 'ok', note: 'Interesanti, bet tālu braukt.',
    date: '2024-08-05', x: 272, y: 175,
  },
]

const RATING_CONFIG = {
  love: { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', label: 'Patika ļoti!', icon: '💚' },
  ok:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: 'Normāli',      icon: '🟡' },
  bad:  { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',  label: 'Nepatika',     icon: '❤️' },
}

/* ── Stat card ─────────────────────────────────────────────────── */
function StatCard({ value, label, color }) {
  return (
    <div className="glass rounded-2xl p-3 text-center flex-1">
      <div className="font-extrabold text-xl" style={{ color }}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────── */
export default function ManaKarte() {
  const [visits]       = useState(DEMO_VISITS)
  const [selected,      setSelected]  = useState(null)   // selected visit dot
  const [showAddPanel,  setShowAddPanel] = useState(false)

  const loveCount = visits.filter((v) => v.rating === 'love').length
  const okCount   = visits.filter((v) => v.rating === 'ok').length
  const badCount  = visits.filter((v) => v.rating === 'bad').length

  return (
    <div className="flex flex-col min-h-dvh relative">
      <BlobBackground />
      <PageHeader title="Mana karte" subtitle="Apmeklētās vietas Latvijā" backTo="/" />

      <div className="page-scroll px-5 pb-28 relative z-10 mt-4">

        {/* ── Stats ── */}
        <div className="flex gap-3 mb-5">
          <StatCard value={visits.length} label="Apmeklētas" color="#6366F1" />
          <StatCard value={loveCount}     label="Iecienītas 💚" color="#22C55E" />
          <StatCard value={okCount}       label="Normālas 🟡" color="#F59E0B" />
        </div>

        {/* ── Map ── */}
        <div className="glass overflow-hidden mb-4" style={{ padding: 0 }}>
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-sm font-bold text-gray-800">Latvijas karte</p>
            <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
              Beta
            </span>
          </div>

          <div className="relative" style={{ background: '#F8F7FF' }}>
            <svg
              viewBox="0 0 354 200"
              className="w-full"
              style={{ display: 'block' }}
            >
              {/* Latvia outline — simplified 8-point polygon */}
              <path
                d="M 5,125 L 27,37 L 80,52 L 135,9 L 310,14 L 354,52 L 349,182 L 5,192 Z"
                fill="rgba(249,115,22,0.06)"
                stroke="rgba(249,115,22,0.30)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Gulf of Riga indentation (water body — lighter area) */}
              <path
                d="M 80,52 L 136,65 L 152,78 L 135,9"
                fill="rgba(147,197,253,0.25)"
                stroke="rgba(147,197,253,0.40)"
                strokeWidth="0.8"
              />

              {/* City dots */}
              {CITY_DOTS.map((c) => (
                <circle
                  key={c.name}
                  cx={c.x} cy={c.y}
                  r={c.major ? 2 : 1.5}
                  fill="rgba(0,0,0,0.18)"
                />
              ))}

              {/* Major city labels */}
              {CITY_DOTS.filter((c) => c.major).map((c) => (
                <text
                  key={c.name + '-label'}
                  x={c.x + 3} y={c.y - 2}
                  fontSize="4.5"
                  fill="rgba(0,0,0,0.40)"
                  fontFamily="system-ui"
                  fontWeight="600"
                >
                  {c.name}
                </text>
              ))}

              {/* Visit dots */}
              {visits.map((v) => {
                const cfg = RATING_CONFIG[v.rating]
                const isSelected = selected?.id === v.id
                return (
                  <g key={v.id} onClick={() => setSelected(isSelected ? null : v)}
                    style={{ cursor: 'pointer' }}>
                    {/* Pulse ring when selected */}
                    {isSelected && (
                      <circle cx={v.x} cy={v.y} r={10}
                        fill="none" stroke={cfg.color} strokeWidth="1.5"
                        opacity="0.4" />
                    )}
                    <circle
                      cx={v.x} cy={v.y} r={isSelected ? 7 : 5.5}
                      fill={cfg.color}
                      stroke="white" strokeWidth="1.5"
                      style={{ transition: 'r 0.2s' }}
                    />
                    <text x={v.x} y={v.y + 1.5}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="5" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                      {v.rating === 'love' ? '♥' : v.rating === 'ok' ? '●' : '✕'}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-2 right-2 flex flex-col gap-1">
              {Object.entries(RATING_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-[9px] text-gray-500 font-medium">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Selected place detail ── */}
        {selected && (() => {
          const cfg = RATING_CONFIG[selected.rating]
          return (
            <div className="mb-4 rounded-2xl overflow-hidden"
              style={{ background: cfg.bg, border: `1px solid ${cfg.color}40` }}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{selected.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin size={10} />{selected.city} · {selected.date}
                    </div>
                  </div>
                  <span className="text-xl">{cfg.icon}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">"{selected.note}"</p>
              </div>
            </div>
          )
        })()}

        {/* ── Visited places list ── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label mb-0">Apmeklētās vietas</p>
            <span className="text-xs text-gray-400">{visits.length} vietas</span>
          </div>
          <div className="space-y-2">
            {visits.map((v) => {
              const cfg = RATING_CONFIG[v.rating]
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(selected?.id === v.id ? null : v)}
                  className="w-full text-left glass p-3 flex items-center gap-3 active:scale-[0.99] transition-all"
                  style={selected?.id === v.id ? { border: `1px solid ${cfg.color}60` } : {}}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                    <span className="text-lg">{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{v.title}</p>
                    <p className="text-xs text-gray-400">{v.city} · {v.date}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Coming soon panel ── */}
        <div className="rounded-2xl p-5 text-center mb-6"
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(168,85,247,0.05))', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="text-3xl mb-2">🗺️</div>
          <h3 className="font-bold text-gray-800 mb-1">Drīzumā — pilna funkcionalitāte</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Foto pielikumi · Atmiņu piezīmes · AI ieteikumi (balstoties uz tava gaumē) ·
            Koplietošana ar draugiem · Offline karte
          </p>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <span>📸 Foto</span>
            <span>🤖 AI</span>
            <span>👥 Koplietot</span>
            <span>📴 Offline</span>
          </div>
        </div>
      </div>

      {/* ── FAB — add visited place ── */}
      <div className="fixed bottom-6 right-1/2 translate-x-[calc(195px-2.5rem)] z-20">
        <button
          onClick={() => setShowAddPanel(true)}
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-transform text-white"
          style={{ background: 'linear-gradient(135deg,#F97316,#FB923C)', boxShadow: '0 8px 24px rgba(249,115,22,0.40)' }}
          aria-label="Pievienot apmeklētu vietu"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* ── Add panel (bottom sheet) ── */}
      {showAddPanel && (
        <div className="fixed inset-0 z-[150]" style={{ pointerEvents: 'auto' }}>
          <div onClick={() => setShowAddPanel(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] rounded-t-3xl p-5 pb-10"
            style={{ background: 'linear-gradient(150deg,#FFF7ED,#FFFFFF)' }}>
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />
            <h3 className="font-bold text-gray-900 text-lg mb-1">Pievienot vietu</h3>
            <p className="text-xs text-gray-400 mb-5">Atzīmē vietu, ko esi apmeklējis</p>

            <div className="space-y-3">
              <div className="glass p-3">
                <input type="text" placeholder="Vietas nosaukums (piem. Turaidas pils)"
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none" />
              </div>
              <div className="glass p-3">
                <input type="text" placeholder="Pilsēta (piem. Sigulda)"
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none" />
              </div>
              <div className="glass p-3">
                <textarea placeholder="Atmiņa vai piezīme (pēc izvēles)..." rows={2}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none resize-none" />
              </div>

              <p className="text-xs font-semibold text-gray-600">Kā bija?</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(RATING_CONFIG).map(([key, cfg]) => (
                  <button key={key} className="rounded-2xl py-3 text-center transition-all active:scale-95"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                    <div className="text-2xl mb-0.5">{cfg.icon}</div>
                    <div className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full btn-primary mt-5" onClick={() => setShowAddPanel(false)}>
              Saglabāt atmiņu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
