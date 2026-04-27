import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import BlobBackground from '../components/BlobBackground'
import Toggle from '../components/Toggle'
import TagSelector from '../components/TagSelector'
import SliderInput from '../components/SliderInput'
import GlassCard from '../components/GlassCard'
import { User, Sparkles } from 'lucide-react'

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

export default function DatePlanner() {
  const navigate = useNavigate()
  const [dateType,     setDateType]     = useState('first')
  const [transport,    setTransport]    = useState([])
  const [vibes,        setVibes]        = useState([])
  const [duration,     setDuration]     = useState(3)
  const [budget,       setBudget]       = useState(60)
  const [partnerName,  setPartnerName]  = useState('')
  const [partnerAge,   setPartnerAge]   = useState('')

  const toggleArr = (setter) => (v) =>
    setter((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])

  const isReady = transport.length > 0 && vibes.length > 0

  const handleGenerate = () =>
    navigate('/route-result', {
      state: { type: 'date', dateType, transport, vibes, duration, budget, partnerName },
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

        {/* Date type */}
        <section className="mt-5 mb-6">
          <p className="section-label">Randiņa veids</p>
          <Toggle options={DATE_TYPE_OPTIONS} value={dateType} onChange={setDateType} />
        </section>

        {/* Partner info */}
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
            <button
              onClick={() => navigate('/partner-profile')}
              className="w-full text-center text-xs text-orange-500 pt-3 active:opacity-60"
            >
              Rediģēt pilno profilu →
            </button>
          </GlassCard>
        </section>

        {/* Transport */}
        <section className="mb-6">
          <p className="section-label">Pārvietošanās</p>
          <TagSelector options={TRANSPORT_OPTIONS} selected={transport} onToggle={toggleArr(setTransport)} />
        </section>

        {/* Vibes */}
        <section className="mb-6">
          <p className="section-label">Noskaņa</p>
          <TagSelector options={VIBE_OPTIONS} selected={vibes} onToggle={toggleArr(setVibes)} />
        </section>

        {/* Duration */}
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

        {/* Budget */}
        <section className="mb-6">
          <p className="section-label">Budžets</p>
          <GlassCard>
            <SliderInput
              label="Uz diviem"
              value={budget}
              onChange={setBudget}
              min={10} max={300} step={5}
              format={(v) => `€${v}`}
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

      {/* CTA */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-5 z-20"
        style={{ background: 'linear-gradient(to top, rgba(255,247,237,0.98) 60%, transparent)' }}
      >
        <button
          onClick={handleGenerate}
          disabled={!isReady}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]
            ${isReady ? 'btn-primary' : 'text-gray-400 cursor-not-allowed'}`}
          style={!isReady ? {
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
          } : {}}
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
