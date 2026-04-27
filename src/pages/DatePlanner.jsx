import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import BlobBackground from '../components/BlobBackground'
import Toggle from '../components/Toggle'
import TagSelector from '../components/TagSelector'
import SliderInput from '../components/SliderInput'
import GlassCard from '../components/GlassCard'
import RescueMode from '../components/RescueMode'
import LocationSection from '../components/LocationSection'
import { useApp } from '../context/AppContext'
import { getSeasonalWarning } from '../utils/seasonal'
import { User, Sparkles, AlertTriangle } from 'lucide-react'

const DATE_TYPE_OPTIONS = [
  { value: 'first',  label: 'Pirmais', icon: '✨' },
  { value: 'repeat', label: 'Atkārtots', icon: '🔁' },
]

const TRANSPORT_OPTIONS = [
  { value: 'car',    label: 'Auto',          icon: '🚗' },
  { value: 'walk',   label: 'Kājām',         icon: '🚶' },
  { value: 'bike',   label: 'Velosipēds',    icon: '🚲' },
  { value: 'public', label: 'Sabiedriskais', icon: '🚌' },
]

const VIBE_OPTIONS = [
  { value: 'romantic',   label: '🌹 Romantisks' },
  { value: 'adventure',  label: '🏔️ Piedzīvojums' },
  { value: 'chill',      label: '☕ Mierīgs' },
  { value: 'cultural',   label: '🎭 Kultūra' },
  { value: 'outdoor',    label: '🌿 Daba' },
  { value: 'foodie',     label: '🍽️ Gastro' },
]

const BUDGET_PRESETS = [
  { label: 'Ekonomisks', value: 30,  icon: '💚' },
  { label: 'Vidējs',     value: 80,  icon: '🧡' },
  { label: 'Premium',    value: 200, icon: '💛' },
]

const MOODS = [
  { value: 'happy',   emoji: '😊', label: 'Laimīga' },
  { value: 'neutral', emoji: '😐', label: 'Neitrāla' },
  { value: 'sad',     emoji: '😢', label: 'Skumja' },
  { value: 'angry',   emoji: '😠', label: 'Sarūgtināta' },
]

export default function DatePlanner() {
  const navigate = useNavigate()
  const { guestMode, partnerProfile } = useApp()

  const [dateType,       setDateType]       = useState('first')
  const [transport,      setTransport]      = useState([])
  const [vibes,          setVibes]          = useState([])
  const [duration,       setDuration]       = useState(3)
  const [budget,         setBudget]         = useState(60)
  const [partnerName,    setPartnerName]    = useState(partnerProfile?.name ?? '')
  const [partnerAge,     setPartnerAge]     = useState(partnerProfile?.age  ?? '')
  const [mood,           setMood]           = useState('neutral')
  const [startLocation,  setStartLocation]  = useState('Rīga')
  const [maxDistance,    setMaxDistance]    = useState(50)
  const [direction,      setDirection]      = useState('all')

  const toggleArr = (setter) => (v) =>
    setter((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])

  const isReady    = transport.length > 0 && vibes.length > 0
  const isDistress = mood === 'angry' || mood === 'sad'
  const warnings   = getSeasonalWarning(vibes, [])

  const handleGenerate = () =>
    navigate('/route-result', {
      state: {
        type: 'date', dateType, transport, vibes, duration, budget,
        partnerName, mood, startLocation, maxDistance, direction,
      },
    })

  return (
    <div className="flex flex-col min-h-dvh relative">
      <BlobBackground />
      <PageHeader
        title="Randiņa plānotājs"
        subtitle="Izveido perfektu dienu diviem"
        backTo="/"
      />

      <div className="page-scroll px-5 pb-36 relative z-10">

        {/* ── Mood selector ── */}
        <section className="mt-5 mb-6">
          <p className="section-label">Kā viņa šodien jūtas?</p>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`rounded-2xl py-3 flex flex-col items-center gap-1 transition-all active:scale-95
                  ${mood === m.value
                    ? isDistress
                      ? 'bg-red-50 border border-red-200 shadow-sm'
                      : 'glass-orange'
                    : 'glass'}`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className={`text-[10px] font-semibold ${
                  mood === m.value
                    ? isDistress ? 'text-red-500' : 'text-orange-600'
                    : 'text-gray-400'
                }`}>{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Rescue Mode ── */}
        {isDistress && !guestMode && (
          <section className="mb-6">
            <RescueMode
              mood={mood}
              partnerName={partnerName || partnerProfile?.name || 'viņai'}
            />
          </section>
        )}

        {/* ── Seasonal warnings ── */}
        {warnings.length > 0 && (
          <div className="mb-6 space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.30)' }}>
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Start location + distance + direction ── */}
        <LocationSection
          startLocation={startLocation} setStartLocation={setStartLocation}
          maxDistance={maxDistance}     setMaxDistance={setMaxDistance}
          direction={direction}         setDirection={setDirection}
        />

        {/* ── Date type ── */}
        <section className="mb-6">
          <p className="section-label">Randiņa veids</p>
          <Toggle options={DATE_TYPE_OPTIONS} value={dateType} onChange={setDateType} />
        </section>

        {/* ── Partner info ── */}
        <section className="mb-6">
          <p className="section-label">Partnera info</p>
          <GlassCard>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.20)' }}>
                <User size={16} className="text-orange-500" />
              </div>
              <input
                type="text"
                placeholder="Partnera vārds (pēc izvēles)"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none"
              />
            </div>
            <div className="border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <input
                type="number"
                placeholder="Vecums (pēc izvēles)"
                value={partnerAge}
                onChange={(e) => setPartnerAge(e.target.value)}
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none"
                min={16} max={99}
              />
            </div>
            {!guestMode && (
              <button
                onClick={() => navigate('/partner-profile')}
                className="w-full text-center text-xs text-orange-500 pt-3 active:opacity-60"
              >
                Rediģēt pilno profilu →
              </button>
            )}
          </GlassCard>
        </section>

        {/* ── Transport ── */}
        <section className="mb-6">
          <p className="section-label">Pārvietošanās</p>
          <TagSelector options={TRANSPORT_OPTIONS} selected={transport} onToggle={toggleArr(setTransport)} />
        </section>

        {/* ── Vibes ── */}
        <section className="mb-6">
          <p className="section-label">Noskaņa</p>
          <TagSelector options={VIBE_OPTIONS} selected={vibes} onToggle={toggleArr(setVibes)} />
        </section>

        {/* ── Duration ── */}
        <section className="mb-6">
          <p className="section-label">Ilgums</p>
          <GlassCard>
            <SliderInput
              label="Stundas"
              value={duration}
              onChange={setDuration}
              min={1} max={12}
              format={(v) => `${v} st.`}
            />
          </GlassCard>
        </section>

        {/* ── Budget ── */}
        <section className="mb-6">
          <p className="section-label">Budžets</p>
          <GlassCard>
            <SliderInput
              label="Uz diviem"
              value={budget}
              onChange={setBudget}
              min={0} max={300} step={5}
              format={(v) => v === 0 ? 'Bezmaksas' : `€${v}`}
            />
          </GlassCard>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {BUDGET_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setBudget(p.value)}
                className={`rounded-2xl py-3 text-xs font-semibold transition-all active:scale-95
                  ${budget === p.value ? 'glass-orange text-orange-600' : 'glass text-gray-500'}`}
              >
                <div className="text-lg mb-0.5">{p.icon}</div>
                {p.label}
                <div className="text-[10px] mt-0.5 opacity-70">€{p.value}</div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── CTA ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-5 z-20"
        style={{ background: 'linear-gradient(to top, rgba(255,247,237,0.98) 60%, transparent)' }}
      >
        <button
          onClick={handleGenerate}
          disabled={!isReady}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]
            ${isReady ? 'btn-primary' : 'text-gray-400 cursor-not-allowed'}`}
          style={!isReady ? { background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' } : {}}
        >
          <Sparkles size={18} />
          Veidot maršrutu
        </button>
        {!isReady && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Izvēlies pārvietošanos un noskaņu
          </p>
        )}
      </div>
    </div>
  )
}
