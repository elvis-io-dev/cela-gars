import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import TagSelector from '../components/TagSelector'
import SliderInput from '../components/SliderInput'
import GlassCard from '../components/GlassCard'
import { Sparkles, Plus, Minus } from 'lucide-react'

const groupOptions = [
  { value: 'solo', label: 'Solo', icon: '🙋' },
  { value: 'couple', label: 'Pāris', icon: '👫' },
  { value: 'friends', label: 'Draugi', icon: '👯' },
  { value: 'family', label: 'Ģimene', icon: '👨‍👩‍👧' },
]

const transportOptions = [
  { value: 'car', label: 'Auto', icon: '🚗' },
  { value: 'walk', label: 'Kājām', icon: '🚶' },
  { value: 'bike', label: 'Velosipēds', icon: '🚲' },
  { value: 'public', label: 'Sabiedriskais', icon: '🚌' },
]

const interestOptions = [
  { value: 'nature', label: '🌿 Daba' },
  { value: 'history', label: '🏰 Vēsture' },
  { value: 'food', label: '🍽️ Ēdiens' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'art', label: '🎨 Māksla' },
  { value: 'music', label: '🎵 Mūzika' },
  { value: 'beach', label: '🏖️ Pludmale' },
  { value: 'hiking', label: '🥾 Pārgājieni' },
  { value: 'nightlife', label: '🌃 Naktsdzīve' },
  { value: 'wellness', label: '🧘 Wellness' },
  { value: 'markets', label: '🛍️ Tirgi' },
  { value: 'kids', label: '🎡 Bērni' },
]

export default function ActivityPlanner() {
  const navigate = useNavigate()
  const [group, setGroup] = useState('friends')
  const [peopleCount, setPeopleCount] = useState(3)
  const [transport, setTransport] = useState([])
  const [interests, setInterests] = useState([])
  const [duration, setDuration] = useState(4)
  const [budget, setBudget] = useState(50)
  const [hasKids, setHasKids] = useState(false)

  const toggleTransport = (v) =>
    setTransport((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )
  const toggleInterest = (v) =>
    setInterests((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )

  const handleGenerate = () => {
    navigate('/route-result', {
      state: { type: 'activity', group, peopleCount, transport, interests, duration, budget, hasKids },
    })
  }

  const isReady = transport.length > 0 && interests.length > 0

  return (
    <div className="flex flex-col min-h-dvh">
      <PageHeader
        title="Aktivitāšu plānotājs"
        subtitle="Atrod ko darīt Latvijā šodien"
        backTo="/"
      />

      <div className="page-scroll px-5 pb-32">
        {/* Group type */}
        <section className="mb-6">
          <p className="section-label">Ar ko dodies?</p>
          <TagSelector
            options={groupOptions.map((g) => ({ value: g.value, label: g.label, icon: g.icon }))}
            selected={group}
            onToggle={setGroup}
            multi={false}
          />
        </section>

        {/* People count */}
        {group !== 'solo' && (
          <section className="mb-6">
            <p className="section-label">Cilvēku skaits</p>
            <GlassCard>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Dalībnieki</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPeopleCount((c) => Math.max(2, c - 1))}
                    className="w-8 h-8 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Minus size={14} className="text-white/70" />
                  </button>
                  <span className="text-white font-bold text-xl w-6 text-center">
                    {peopleCount}
                  </span>
                  <button
                    onClick={() => setPeopleCount((c) => Math.min(20, c + 1))}
                    className="w-8 h-8 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus size={14} className="text-white/70" />
                  </button>
                </div>
              </div>
            </GlassCard>

            {group === 'family' && (
              <button
                onClick={() => setHasKids((v) => !v)}
                className={`mt-2 w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]
                  ${hasKids ? 'glass-orange text-primary' : 'glass text-white/50'}`}
              >
                {hasKids ? '✅' : '⬜'} Ir bērni (piemērotas aktivitātes)
              </button>
            )}
          </section>
        )}

        {/* Transport */}
        <section className="mb-6">
          <p className="section-label">Pārvietošanās</p>
          <TagSelector
            options={transportOptions.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))}
            selected={transport}
            onToggle={toggleTransport}
          />
        </section>

        {/* Interests */}
        <section className="mb-6">
          <p className="section-label">Intereses</p>
          <TagSelector
            options={interestOptions}
            selected={interests}
            onToggle={toggleInterest}
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
          <p className="section-label">Budžets uz personu</p>
          <GlassCard>
            <SliderInput
              label="Uz vienu cilvēku"
              value={budget}
              onChange={setBudget}
              min={0}
              max={200}
              step={5}
              format={(v) => v === 0 ? 'Bezmaksas' : `€${v}`}
            />
          </GlassCard>

          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: 'Bezmaksas', value: 0 },
              { label: '€20', value: 20 },
              { label: '€50', value: 50 },
              { label: '€100', value: 100 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setBudget(p.value)}
                className={`rounded-xl py-2 text-xs font-medium transition-all active:scale-95
                  ${budget === p.value ? 'glass-orange text-primary' : 'glass text-white/40'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, rgba(15,10,0,0.95) 60%, transparent)' }}
      >
        <button
          onClick={handleGenerate}
          disabled={!isReady}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]
            ${isReady ? 'btn-primary' : 'glass text-white/30 cursor-not-allowed'}`}
        >
          <Sparkles size={18} />
          Atrast aktivitātes
        </button>
        {!isReady && (
          <p className="text-center text-xs text-white/25 mt-2">
            Izvēlies pārvietošanos un intereses
          </p>
        )}
      </div>
    </div>
  )
}
