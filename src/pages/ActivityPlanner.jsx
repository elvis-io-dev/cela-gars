import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import BlobBackground from '../components/BlobBackground'
import TagSelector from '../components/TagSelector'
import SliderInput from '../components/SliderInput'
import GlassCard from '../components/GlassCard'
import LocationSection from '../components/LocationSection'
import { Sparkles, Plus, Minus } from 'lucide-react'

const GROUP_OPTIONS = [
  { value: 'solo',    label: 'Solo',   icon: '🙋' },
  { value: 'couple',  label: 'Pāris',  icon: '👫' },
  { value: 'friends', label: 'Draugi', icon: '👯' },
  { value: 'family',  label: 'Ģimene', icon: '👨‍👩‍👧' },
]

const TRANSPORT_OPTIONS = [
  { value: 'car',    label: 'Auto',          icon: '🚗' },
  { value: 'walk',   label: 'Kājām',         icon: '🚶' },
  { value: 'bike',   label: 'Velosipēds',    icon: '🚲' },
  { value: 'public', label: 'Sabiedriskais', icon: '🚌' },
]

const INTEREST_OPTIONS = [
  { value: 'nature',    label: '🌿 Daba' },
  { value: 'history',   label: '🏰 Vēsture' },
  { value: 'food',      label: '🍽️ Ēdiens' },
  { value: 'sports',    label: '⚽ Sports' },
  { value: 'art',       label: '🎨 Māksla' },
  { value: 'music',     label: '🎵 Mūzika' },
  { value: 'beach',     label: '🏖️ Pludmale' },
  { value: 'hiking',    label: '🥾 Pārgājieni' },
  { value: 'nightlife', label: '🌃 Naktsdzīve' },
  { value: 'wellness',  label: '🧘 Wellness' },
  { value: 'markets',   label: '🛍️ Tirgi' },
  { value: 'kids',      label: '🎡 Bērni' },
]

const BUDGET_PRESETS = [
  { label: 'Bezmaksas', value: 0   },
  { label: '€20',       value: 20  },
  { label: '€50',       value: 50  },
  { label: '€100',      value: 100 },
]

export default function ActivityPlanner() {
  const navigate = useNavigate()
  const [group,         setGroup]         = useState('friends')
  const [peopleCount,   setPeopleCount]   = useState(3)
  const [transport,     setTransport]     = useState([])
  const [interests,     setInterests]     = useState([])
  const [duration,      setDuration]      = useState(4)
  const [budget,        setBudget]        = useState(50)
  const [hasKids,       setHasKids]       = useState(false)
  const [hasDog,        setHasDog]        = useState(false)
  const [startPlace,    setStartPlace]    = useState({ name: 'Rīga', lat: 56.946, lon: 24.105 })
  const [maxDistance,   setMaxDistance]   = useState(100)

  const toggleArr = (setter) => (v) =>
    setter((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])

  const isReady = transport.length > 0 && interests.length > 0

  const handleGenerate = () =>
    navigate('/route-result', {
      state: {
        type: 'activity', group, peopleCount, transport, interests,
        duration, budget, hasKids, hasDog,
        startPlace, maxDistance,
      },
    })

  const CounterBtn = ({ onClick, children }) => (
    <button
      onClick={onClick}
      className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
      style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-col min-h-dvh relative">
      <BlobBackground />
      <PageHeader
        title="Aktivitāšu plānotājs"
        subtitle="Atrod ko darīt Latvijā šodien"
        backTo="/"
      />

      <div className="page-scroll px-5 pb-36 relative z-10">

        {/* ── Group type ── */}
        <section className="mt-5 mb-6">
          <p className="section-label">Ar ko dodies?</p>
          <TagSelector options={GROUP_OPTIONS} selected={group} onToggle={setGroup} multi={false} />
        </section>

        {/* ── People count ── */}
        {group !== 'solo' && (
          <section className="mb-6">
            <p className="section-label">Cilvēku skaits</p>
            <GlassCard>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Dalībnieki</span>
                <div className="flex items-center gap-4">
                  <CounterBtn onClick={() => setPeopleCount((c) => Math.max(2, c - 1))}>
                    <Minus size={14} className="text-gray-600" />
                  </CounterBtn>
                  <span className="text-gray-900 font-bold text-xl w-6 text-center">{peopleCount}</span>
                  <CounterBtn onClick={() => setPeopleCount((c) => Math.min(20, c + 1))}>
                    <Plus size={14} className="text-gray-600" />
                  </CounterBtn>
                </div>
              </div>
            </GlassCard>
            {group === 'family' && (
              <button
                onClick={() => setHasKids((v) => !v)}
                className={`mt-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]
                  ${hasKids ? 'glass-orange text-orange-600' : 'glass text-gray-500'}`}
              >
                {hasKids ? '✅' : '⬜'} Ir bērni (piemērotas aktivitātes)
              </button>
            )}
          </section>
        )}

        {/* ── Dog toggle ── */}
        <section className="mb-6">
          <p className="section-label">Suns nāk līdzi?</p>
          <button
            onClick={() => setHasDog((v) => !v)}
            className={`w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98]
              ${hasDog ? 'glass-orange text-orange-600' : 'glass text-gray-500'}`}
          >
            <span className="text-2xl">{hasDog ? '🐕' : '🐾'}</span>
            {hasDog ? 'Suns nāk — piemērotas vietas' : 'Nāks suns (suņiem draudzīgas vietas)'}
          </button>
          {hasDog && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Maršruts ietvers suņiem draudzīgas vietas un parkus
            </p>
          )}
        </section>

        {/* ── Start location + distance + direction ── */}
        <LocationSection
          startPlace={startPlace}   setStartPlace={setStartPlace}
          maxDistance={maxDistance} setMaxDistance={setMaxDistance}
        />

        {/* ── Transport ── */}
        <section className="mb-6">
          <p className="section-label">Pārvietošanās</p>
          <TagSelector options={TRANSPORT_OPTIONS} selected={transport} onToggle={toggleArr(setTransport)} />
        </section>

        {/* ── Interests ── */}
        <section className="mb-6">
          <p className="section-label">Intereses</p>
          <TagSelector options={INTEREST_OPTIONS} selected={interests} onToggle={toggleArr(setInterests)} />
        </section>

        {/* ── Duration ── */}
        <section className="mb-6">
          <p className="section-label">Ilgums</p>
          <GlassCard>
            <SliderInput
              label="Stundas" value={duration} onChange={setDuration}
              min={1} max={12} format={(v) => `${v} st.`}
            />
          </GlassCard>
        </section>

        {/* ── Budget ── */}
        <section className="mb-6">
          <p className="section-label">Budžets uz personu</p>
          <GlassCard>
            <SliderInput
              label="Uz vienu cilvēku" value={budget} onChange={setBudget}
              min={0} max={200} step={5}
              format={(v) => v === 0 ? 'Bezmaksas' : `€${v}`}
            />
          </GlassCard>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {BUDGET_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setBudget(p.value)}
                className={`rounded-2xl py-2.5 text-xs font-semibold transition-all active:scale-95
                  ${budget === p.value ? 'glass-orange text-orange-600' : 'glass text-gray-500'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── CTA ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-5 z-20"
        style={{ background: 'linear-gradient(to top, rgba(245,243,255,0.98) 60%, transparent)' }}
      >
        <button
          onClick={handleGenerate}
          disabled={!isReady}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]
            ${isReady ? 'btn-primary' : 'text-gray-400 cursor-not-allowed'}`}
          style={!isReady ? { background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' } : {}}
        >
          <Sparkles size={18} />
          Atrast aktivitātes
        </button>
        {!isReady && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Izvēlies pārvietošanos un intereses
          </p>
        )}
      </div>
    </div>
  )
}
