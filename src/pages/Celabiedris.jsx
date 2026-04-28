/**
 * Ceļabiedris — Travel Companion Finder
 *
 * Three modes:
 *   buddy    — hiking / trip partners (no romantic intent)
 *   romantic — meet through shared adventure
 *   group    — join or create a group trip
 *
 * Cards are swiped left (skip) / right (interested).
 * Mutual match → chat (not yet implemented, shows coming-soon).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import BlobBackground from '../components/BlobBackground'
import { Heart, X, Users, Star, MapPin, AlertTriangle, ChevronRight, Check } from 'lucide-react'

/* ── Mock profiles ────────────────────────────────────────────── */
const BUDDY_PROFILES = [
  {
    id: 1, name: 'Māris', age: 29, city: 'Rīga',
    avatar: '🧗', fitness: '💪💪💪', pace: 'Ātrs',
    interests: ['Pārgājieni', 'Klinšu kāpšana', 'Foto'],
    looking: 'Biedrs maršrutam Gaujas NP — plāno nākamajā sestdienā',
    route: 'Gaujas NP — Velnala taka (14 km)',
    when: 'Sestdien, 10:00',
    equipment: ['Zābaki', 'Mugursoma', 'GPS'],
    verified: true,
  },
  {
    id: 2, name: 'Līga', age: 26, city: 'Jūrmala',
    avatar: '🚴', fitness: '💪💪', pace: 'Vidējs',
    interests: ['Velo', 'Pludmale', 'Joga'],
    looking: 'Velo tūre pa Jūrmalu un Ķemeri — meklē 1–2 cilvēkus',
    route: 'Jūrmala – Ķemeri (25 km)',
    when: 'Svētdien, 09:00',
    equipment: ['Velosipēds', 'Ķivere'],
    verified: true,
  },
  {
    id: 3, name: 'Andris', age: 34, city: 'Sigulda',
    avatar: '🏕️', fitness: '💪💪', pace: 'Mierīgs',
    interests: ['Kempings', 'Makšķerēšana', 'Daba'],
    looking: 'Nakts kempings Gaujas krastā — laiva un uguns garantēta',
    route: 'Sigulda — Gauja (upes krasts)',
    when: 'Piektdien – sestdien',
    equipment: ['Telts', 'Laiva', 'Makšķere'],
    verified: false,
  },
]

const ROMANTIC_PROFILES = [
  {
    id: 4, name: 'Anna', age: 27, city: 'Rīga',
    avatar: '🌿', fitness: '💪💪', pace: 'Mierīgs',
    interests: ['Daba', 'Fotogrāfija', 'Ceļošana'],
    looking: 'Kāds, ar ko kopā atklāt Latvijas dabas skaistumu',
    vibe: 'Mierīga, brīnumu meklētāja',
    verified: true,
  },
  {
    id: 5, name: 'Ieva', age: 31, city: 'Cēsis',
    avatar: '🎨', fitness: '💪', pace: 'Mierīgs',
    interests: ['Kultūra', 'Gastronomija', 'Māksla'],
    looking: 'Kopīgas pieredzes virs romances — gastronomisks ceļojums',
    vibe: 'Radoša, spontānea',
    verified: true,
  },
]

const GROUP_TRIPS = [
  {
    id: 6, name: 'Pārgājiens Gaujas NP', organiser: 'Māris K.',
    avatar: '🌲',
    desc: 'Pilna diena Gaujas NP — Velnala taka, pils skats, peldēšanās. Iesācēji laipni aicināti!',
    date: '3. maijs, 10:00',
    location: 'Sigulda',
    spots: 3, totalSpots: 8,
    members: ['🧗','🚴','🏕️','🌿'],
    tags: ['Daba', 'Ģimenes draudzīgs', 'Bezmaksas'],
  },
  {
    id: 7, name: 'Velobrauciens Jūrmala–Tukums', organiser: 'Zane P.',
    avatar: '🚲',
    desc: 'Viegls velo maršruts gar jūru. Velo noma pieejama Jūrmalā. Beidzam ar kafiju un pīrādziņiem.',
    date: '10. maijs, 09:30',
    location: 'Jūrmala → Tukums',
    spots: 4, totalSpots: 6,
    members: ['🚴','🌊','☕'],
    tags: ['Velo', 'Viegls', '€5–10'],
  },
  {
    id: 8, name: 'SUP maršruts Kanieris',  organiser: 'Toms B.',
    avatar: '🏄',
    desc: 'SUP dēļi nodrošināti. 2 h pa Kaniera ezeru + ekskursija pa Ķemeru puru. Iesācēji ļoti laipni aicināti.',
    date: '17. maijs, 11:00',
    location: 'Ķemeri',
    spots: 2, totalSpots: 5,
    members: ['🌊','🏄','🌿','☀️','🐸'],
    tags: ['Ūdens sports', 'Daba', '€15'],
  },
]

/* ── Mode config ──────────────────────────────────────────────── */
const MODES = [
  {
    id: 'buddy',
    icon: '🤝', label: 'Ceļa biedrs',
    desc: 'Pārgājieni, velo, piedzīvojumi ar jauniem cilvēkiem',
    color: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.25)',
    accent: '#3B82F6',
  },
  {
    id: 'romantic',
    icon: '❤️', label: 'Romantisks',
    desc: 'Iepazīšanās caur kopīgu piedzīvojumu',
    color: 'rgba(249,115,22,0.10)',
    border: 'rgba(249,115,22,0.25)',
    accent: '#F97316',
  },
  {
    id: 'group',
    icon: '👥', label: 'Grupas izbrauciens',
    desc: 'Pievienojies plānotam braucienam vai izveido savu',
    color: 'rgba(168,85,247,0.10)',
    border: 'rgba(168,85,247,0.25)',
    accent: '#A855F7',
  },
]

/* ── Sub-components ───────────────────────────────────────────── */

function BuddyCard({ profile, onLike, onSkip }) {
  return (
    <div className="glass overflow-hidden">
      {/* Top banner */}
      <div className="h-28 flex items-center justify-center text-6xl relative"
        style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(168,85,247,0.08))' }}>
        {profile.avatar}
        {profile.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            <Check size={10} /> Verificēts
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Name + meta */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{profile.name}, {profile.age}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} />{profile.city}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm">{profile.fitness}</span>
            <span className="text-xs text-gray-400">{profile.pace} temps</span>
          </div>
        </div>

        {/* Route */}
        <div className="rounded-xl p-3 mb-3"
          style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <p className="text-xs font-semibold text-blue-700 mb-0.5">📍 {profile.route}</p>
          <p className="text-xs text-blue-600">⏰ {profile.when}</p>
        </div>

        {/* Looking for */}
        <p className="text-xs text-gray-500 leading-relaxed mb-3">"{profile.looking}"</p>

        {/* Interests */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.interests.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-lg font-medium"
              style={{ background: 'rgba(59,130,246,0.09)', color: '#2563EB', border: '1px solid rgba(59,130,246,0.18)' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button onClick={onSkip}
            className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-95"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444' }}>
            <X size={16} /> Izlaist
          </button>
          <button onClick={onLike}
            className="flex-[2] py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)', boxShadow: '0 4px 16px rgba(59,130,246,0.30)' }}>
            <Check size={16} /> Pievienoties
          </button>
        </div>
      </div>
    </div>
  )
}

function RomanticCard({ profile, onLike, onSkip }) {
  return (
    <div className="glass overflow-hidden">
      <div className="h-32 flex items-center justify-center text-6xl relative"
        style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(251,191,36,0.08))' }}>
        {profile.avatar}
        {profile.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
            <Check size={10} /> Verificēts
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{profile.name}, {profile.age}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={11} />{profile.city}
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-xl"
            style={{ background: 'rgba(249,115,22,0.10)', color: '#EA580C', border: '1px solid rgba(249,115,22,0.20)' }}>
            {profile.vibe}
          </span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-3 italic">"{profile.looking}"</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.interests.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-lg font-medium"
              style={{ background: 'rgba(249,115,22,0.09)', color: '#EA580C', border: '1px solid rgba(249,115,22,0.18)' }}>
              {t}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onSkip}
            className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-95"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444' }}>
            <X size={16} /> Nē
          </button>
          <button onClick={onLike}
            className="flex-[2] py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg,#F97316,#FB923C)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
            <Heart size={16} /> Interesē
          </button>
        </div>
      </div>
    </div>
  )
}

function GroupCard({ trip, onJoin, onSkip }) {
  const pct = Math.round(((trip.totalSpots - trip.spots) / trip.totalSpots) * 100)
  return (
    <div className="glass overflow-hidden">
      <div className="h-24 flex items-center justify-center text-5xl relative"
        style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(99,102,241,0.08))' }}>
        {trip.avatar}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-1">{trip.name}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1"><MapPin size={11} />{trip.location}</span>
          <span>⏰ {trip.date}</span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-3">{trip.desc}</p>

        {/* Members preview */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-1">
            {trip.members.map((m, i) => (
              <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white"
                style={{ background: 'rgba(168,85,247,0.12)' }}>
                {m}
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {trip.totalSpots - trip.spots} dalībnieki · <span className="text-purple-600 font-semibold">{trip.spots} vietas brīvas</span>
          </span>
        </div>

        {/* Fill bar */}
        <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(168,85,247,0.12)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#A855F7,#6366F1)' }} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {trip.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-lg font-medium"
              style={{ background: 'rgba(168,85,247,0.09)', color: '#7C3AED', border: '1px solid rgba(168,85,247,0.18)' }}>
              {t}
            </span>
          ))}
        </div>

        {/* Organiser */}
        <p className="text-[11px] text-gray-400 mb-4">Organizē: <span className="text-gray-600 font-medium">{trip.organiser}</span></p>

        <div className="flex gap-3">
          <button onClick={onSkip}
            className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-95"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444' }}>
            <X size={16} /> Izlaist
          </button>
          <button onClick={onJoin}
            className="flex-[2] py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)', boxShadow: '0 4px 16px rgba(168,85,247,0.30)' }}>
            <Users size={16} /> Pievienoties
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────── */

export default function Celabiedris() {
  const navigate = useNavigate()
  const [mode,      setMode]      = useState(null)   // null = mode selection screen
  const [cardIdx,   setCardIdx]   = useState(0)
  const [matched,   setMatched]   = useState(false)
  const [warning,   setWarning]   = useState(true)   // show warning banner on entry

  const profiles = mode === 'buddy'    ? BUDDY_PROFILES
                 : mode === 'romantic' ? ROMANTIC_PROFILES
                 : GROUP_TRIPS

  const current = profiles[cardIdx]
  const isGroup = mode === 'group'

  const handleLike = () => {
    // 50% chance of "match" on first like (demo)
    if (!isGroup && cardIdx === 0 && Math.random() > 0.5) {
      setMatched(true)
      return
    }
    setCardIdx((i) => Math.min(i + 1, profiles.length - 1))
  }

  const handleSkip = () => {
    setCardIdx((i) => Math.min(i + 1, profiles.length - 1))
  }

  const noMoreCards = cardIdx >= profiles.length

  /* ── Mode selection screen ── */
  if (!mode) {
    return (
      <div className="flex flex-col min-h-dvh relative">
        <BlobBackground />
        <PageHeader title="Ceļabiedris" subtitle="Atrodi savu ceļojuma biedru" backTo="/" />

        <div className="page-scroll px-5 pb-10 relative z-10 mt-5">
          {/* Warning */}
          <div className="flex items-start gap-3 rounded-2xl px-4 py-3 mb-6"
            style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.30)' }}>
            <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-bold">Šī sadaļa ir piedzīvojumu meklētājiem!</span>{' '}
              Atrodi cilvēkus ar kopīgām interesēm — drošība ir prioritāte. Tikos publiskās vietās.
            </p>
          </div>

          <p className="section-label">Izvēlies režīmu</p>

          <div className="flex flex-col gap-4">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className="w-full text-left p-5 rounded-3xl transition-all active:scale-[0.98] flex items-start gap-4"
                style={{
                  background: m.color,
                  border: `1px solid ${m.border}`,
                  boxShadow: `0 4px 20px ${m.border}`,
                }}
              >
                <span className="text-4xl shrink-0">{m.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{m.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 shrink-0 mt-1 ml-auto" />
              </button>
            ))}
          </div>

          {/* Coming-soon notice */}
          <div className="mt-6 rounded-2xl p-4 text-center"
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}>
            <p className="text-sm font-semibold text-gray-700 mb-1">🚧 Beta versija</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Šī funkcija ir demonstrācijas režīmā. Pilna versija ar reāliem profiliem,
              drošības verifikāciju un čatu tiek izstrādāta.
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Match screen ── */
  if (matched) {
    return (
      <div className="flex flex-col min-h-dvh relative items-center justify-center">
        <BlobBackground />
        <div className="relative z-10 text-center px-8">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h2 className="font-extrabold text-3xl text-gray-900 mb-2">Sakritība!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Jūs abi izrādījāt interesi. Sāciet planot kopā!
          </p>
          <div className="glass p-4 mb-6 text-center">
            <p className="text-xs text-gray-400 mb-2">Čats pieejams drīzumā 💬</p>
            <p className="text-xs text-gray-400">Pagaidām — sazinieties caur mūsu drošo platformu</p>
          </div>
          <button onClick={() => { setMatched(false); setCardIdx(0); setMode(null) }}
            className="btn-primary w-full">
            Turpināt meklēt
          </button>
          <button onClick={() => navigate('/')} className="mt-3 w-full text-sm text-gray-400 py-2">
            Atpakaļ uz sākumu
          </button>
        </div>
      </div>
    )
  }

  /* ── Swipe screen ── */
  const modeConfig = MODES.find((m) => m.id === mode)

  return (
    <div className="flex flex-col min-h-dvh relative">
      <BlobBackground />
      <PageHeader
        title={modeConfig.label}
        subtitle={`${profiles.length - cardIdx} profil${profiles.length - cardIdx === 1 ? 's' : 'i'} pieejami`}
        backTo="/celabiedris"
      />

      <div className="page-scroll px-5 pb-10 relative z-10 mt-4">
        {warning && (
          <div className="flex items-start gap-3 rounded-2xl px-4 py-3 mb-4"
            style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.30)' }}>
            <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed flex-1">
              Satiec jaunus cilvēkus tikai publiskās vietās. Drošums ir prioritāte.
            </p>
            <button onClick={() => setWarning(false)} className="text-amber-400 shrink-0">
              <X size={13} />
            </button>
          </div>
        )}

        {noMoreCards ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Visi profili apskatīti</h3>
            <p className="text-sm text-gray-400 mb-6">Pagaidi, kamēr parādās jauni biedri</p>
            <button onClick={() => setCardIdx(0)}
              className="btn-primary px-8">
              Skatīt vēlreiz
            </button>
          </div>
        ) : (
          <div>
            {/* Card stack hint — show peeking card behind */}
            {cardIdx + 1 < profiles.length && (
              <div className="mx-3 rounded-3xl overflow-hidden mb-[-14px] mt-0"
                style={{
                  height: 12,
                  background: 'rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  transform: 'scale(0.96)',
                }}
              />
            )}

            {mode === 'buddy' && (
              <BuddyCard profile={current} onLike={handleLike} onSkip={handleSkip} />
            )}
            {mode === 'romantic' && (
              <RomanticCard profile={current} onLike={handleLike} onSkip={handleSkip} />
            )}
            {mode === 'group' && (
              <GroupCard trip={current} onJoin={handleLike} onSkip={handleSkip} />
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {profiles.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: i === cardIdx
                      ? modeConfig.accent
                      : i < cardIdx
                        ? 'rgba(0,0,0,0.15)'
                        : 'rgba(0,0,0,0.08)',
                    transform: i === cardIdx ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Create your own group (group mode only) */}
        {mode === 'group' && !noMoreCards && (
          <div className="mt-5 rounded-2xl p-4 text-center"
            style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.18)' }}>
            <p className="text-sm font-semibold text-purple-700 mb-1">
              Plāno savu izbraucienu?
            </p>
            <p className="text-xs text-purple-500 mb-3">
              Izveido grupu un atrodi biedrus brauciena organizēšanai
            </p>
            <button className="text-xs font-bold text-white px-4 py-2 rounded-xl"
              style={{ background: 'linear-gradient(135deg,#A855F7,#6366F1)' }}>
              + Izveidot grupu (drīzumā)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
