import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Toggle from '../components/Toggle'
import TagSelector from '../components/TagSelector'
import SliderInput from '../components/SliderInput'
import GlassCard from '../components/GlassCard'
import { User, Sparkles } from 'lucide-react'

const dateTypeOptions = [
  { value: 'first', label: 'Pirmais', icon: '✨' },
  { value: 'repeat', label: 'Atkārtots', icon: '🔁' },
]

const transportOptions = [
  { value: 'car', label: 'Auto', icon: '🚗' },
  { value: 'walk', label: 'Kājām', icon: '🚶' },
  { value: 'bike', label: 'Velosipēds', icon: '🚲' },
  { value: 'public', label: 'Sabiedriskais', icon: '🚌' },
]

const vibeOptions = [
  { value: 'romantic', label: '🌹 Romantisks' },
  { value: 'adventure', label: '🏔️ Piedzīvojums' },
  { value: 'chill', label: '☕ Mierīgs' },
  { value: 'cultural', label: '🎭 Kultūra' },
  { value: 'outdoor', label: '🌿 Daba' },
  { value: 'foodie', label: '🍽️ Gastro' },
]

export default function DatePlanner() {
  const navigate = useNavigate()
  const [dateType, setDateType] = useState('first')
  const [transport, setTransport] = useState([])
  const [vibes, setVibes] = useState([])
  const [duration, setDuration] = useState(3)
  const [budget, setBudget] = useState(60)
  const [partnerName, setPartnerName] = useState('')
  const [partnerAge, setPartnerAge] = useState('')

  const toggleTransport = (v) =>
    setTransport((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )

  const toggleVibe = (v) =>
    setVibes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )

  const handleGenerate = () => {
    navigate('/route-result', {
      state: { type: 'date', dateType, transport, vibes, duration, budget, partnerName },
    })
  }

  const isReady = transport.length > 0 && vibes.length > 0

  return (
    <div className="flex flex-col min-h-dvh">
      <PageHeader
        title="Randiņa plānotājs"
        subtitle="Izveido perfektu dienu diviem"
        backTo="/"
      />

      <div className="page-scroll px-5 pb-32">
        {/* Date type */}
        <section className="mb-6">
          <p className="section-label">Randiņa veids</p>
          <Toggle
            options={dateTypeOptions}
            value={dateType}
            onChange={setDateType}
          />
        </section>

        {/* Partner info */}
        <section className="mb-6">
          <p className="section-label">Partnera info</p>
          <GlassCard className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                <User size={16} className="text-primary" />
              </div>
              <input
                type="text"
                placeholder="Partnera vārds (pēc izvēles)"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
              />
            </div>
            <div className="border-t border-white/5 pt-3">
              <input
                type="number"
                placeholder="Vecums (pēc izvēles)"
                value={partnerAge}
                onChange={(e) => setPartnerAge(e.target.value)}
                className="w-full bg-transparent text-white placeholder-white/30 text-sm outline-none"
                min={16}
                max={99}
              />
            </div>
            <button
              onClick={() => navigate('/partner-profile')}
              className="w-full text-center text-xs text-primary/70 pt-1 active:opacity-60"
            >
              Rediģēt pilno profilu →
            </button>
          </GlassCard>
        </section>

        {/* Transport */}
        <section className="mb-6">
          <p className="section-label">Pārvietošanās</p>
          <TagSelector
            options={transportOptions.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))}
            selected={transport}
            onToggle={toggleTransport}
          />
        </section>

        {/* Vibes */}
        <section className="mb-6">
          <p className="section-label">Noskaņa</p>
          <TagSelector
            options={vibeOptions}
            selected={vibes}
            onToggle={toggleVibe}
          />
        </section>

        {/* Duration */}
        <section className="mb-6">
          <p className="section-label">Ilgums</p>
          <GlassCard>
            <SliderInput
              label="Stundas"
              value={duration}
              onChange={setDuration}
              min={1}
              max={12}
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
              min={10}
              max={300}
              step={5}
              format={(v) => `€${v}`}
            />
          </GlassCard>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Ekonomisks', value: 30, icon: '💚' },
              { label: 'Vidējs', value: 80, icon: '🧡' },
              { label: 'Premium', value: 200, icon: '💛' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setBudget(preset.value)}
                className={`rounded-xl py-2.5 text-xs font-medium transition-all active:scale-95
                  ${budget === preset.value
                    ? 'glass-orange text-primary border-primary/40'
                    : 'glass text-white/50'
                  }`}
              >
                <div className="text-base mb-0.5">{preset.icon}</div>
                {preset.label}
                <div className="text-[10px] opacity-60 mt-0.5">€{preset.value}</div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, rgba(15,10,0,0.95) 60%, transparent)' }}
      >
        <button
          onClick={handleGenerate}
          disabled={!isReady}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]
            ${isReady
              ? 'btn-primary'
              : 'glass text-white/30 cursor-not-allowed'
            }`}
        >
          <Sparkles size={18} />
          Veidot maršrutu
        </button>
        {!isReady && (
          <p className="text-center text-xs text-white/25 mt-2">
            Izvēlies pārvietošanos un noskaņu
          </p>
        )}
      </div>
    </div>
  )
}
