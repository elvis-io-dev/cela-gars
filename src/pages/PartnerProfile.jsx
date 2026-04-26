import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import TagSelector from '../components/TagSelector'
import { Check, Trash2 } from 'lucide-react'

const interestOptions = [
  { value: 'nature', label: '🌿 Daba' },
  { value: 'art', label: '🎨 Māksla' },
  { value: 'food', label: '🍽️ Ēdiens' },
  { value: 'music', label: '🎵 Mūzika' },
  { value: 'history', label: '🏰 Vēsture' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'cinema', label: '🎬 Kino' },
  { value: 'travel', label: '✈️ Ceļošana' },
  { value: 'reading', label: '📚 Lasīšana' },
  { value: 'cooking', label: '👨‍🍳 Gatavošana' },
  { value: 'photography', label: '📷 Foto' },
  { value: 'yoga', label: '🧘 Joga' },
]

const personalityOptions = [
  { value: 'adventurous', label: '🏔️ Piedzīvojumu meklētājs' },
  { value: 'calm', label: '🌊 Mierīgs un pamatīgs' },
  { value: 'social', label: '🎉 Sabiedrisks' },
  { value: 'creative', label: '🎨 Radošs' },
  { value: 'intellectual', label: '🧠 Intelektuāls' },
  { value: 'humorous', label: '😄 Humoristisks' },
  { value: 'romantic', label: '🌹 Romantisks' },
  { value: 'sporty', label: '🏃 Sportisks' },
]

const dislikeOptions = [
  { value: 'crowds', label: '😤 Pūļi' },
  { value: 'loud', label: '🔊 Trokšņainas vietas' },
  { value: 'spicy', label: '🌶️ Pikants ēdiens' },
  { value: 'heights', label: '😰 Augstumi' },
  { value: 'cold', label: '🥶 Aukstums' },
  { value: 'early', label: '⏰ Agra celšanās' },
  { value: 'horror', label: '👻 Šausmu žanrs' },
  { value: 'formal', label: '👔 Formālas vietas' },
]

const avatarEmojis = ['👩', '👨', '🧑', '👱', '🧔', '👩‍🦰', '👩‍🦱', '🧕', '👲', '🎭']

export default function PartnerProfile() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [avatar, setAvatar] = useState('👩')
  const [interests, setInterests] = useState([])
  const [personality, setPersonality] = useState([])
  const [dislikes, setDislikes] = useState([])
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const toggleInterest = (v) =>
    setInterests((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])
  const togglePersonality = (v) =>
    setPersonality((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])
  const toggleDislike = (v) =>
    setDislikes((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate(-1)
    }, 1000)
  }

  const handleClear = () => {
    setName('')
    setAge('')
    setAvatar('👩')
    setInterests([])
    setPersonality([])
    setDislikes([])
    setNote('')
  }

  const completeness = [
    name.trim().length > 0,
    age.trim().length > 0,
    interests.length > 0,
    personality.length > 0,
    dislikes.length > 0,
  ].filter(Boolean).length

  return (
    <div className="flex flex-col min-h-dvh">
      <PageHeader
        title="Partnera profils"
        subtitle="Personalizē pieredzi"
        backTo="/"
        action={
          <button
            onClick={handleClear}
            className="glass w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
            aria-label="Notīrīt profilu"
          >
            <Trash2 size={14} className="text-white/50" />
          </button>
        }
      />

      <div className="page-scroll px-5 pb-32">

        {/* Completeness bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Profila pilnīgums</span>
            <span className="text-primary">{completeness}/5</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(completeness / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Avatar + basic info */}
        <section className="mb-6">
          <p className="section-label">Pamatinformācija</p>
          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              {/* Avatar */}
              <button
                onClick={() => setShowAvatarPicker((v) => !v)}
                className="w-16 h-16 rounded-2xl glass-orange flex items-center justify-center text-3xl shrink-0 active:scale-90 transition-transform"
                aria-label="Mainīt avatāru"
              >
                {avatar}
              </button>
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Vārds"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-white/30 text-sm outline-none border-b border-white/10 pb-2 focus:border-primary/40 transition-colors"
                />
                <input
                  type="number"
                  placeholder="Vecums"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={16}
                  max={99}
                  className="w-full bg-transparent text-white placeholder-white/30 text-sm outline-none border-b border-white/10 pb-2 focus:border-primary/40 transition-colors"
                />
              </div>
            </div>

            {showAvatarPicker && (
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-white/30 mb-2">Izvēlies avatāru</p>
                <div className="flex flex-wrap gap-2">
                  {avatarEmojis.map((e) => (
                    <button
                      key={e}
                      onClick={() => { setAvatar(e); setShowAvatarPicker(false) }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all active:scale-90
                        ${avatar === e ? 'glass-orange' : 'glass'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </section>

        {/* Interests */}
        <section className="mb-6">
          <p className="section-label">Intereses</p>
          <TagSelector
            options={interestOptions}
            selected={interests}
            onToggle={toggleInterest}
          />
          {interests.length > 0 && (
            <p className="text-xs text-white/30 mt-2">
              {interests.length} izvēlēts
            </p>
          )}
        </section>

        {/* Personality */}
        <section className="mb-6">
          <p className="section-label">Personības iezīmes</p>
          <TagSelector
            options={personalityOptions}
            selected={personality}
            onToggle={togglePersonality}
          />
        </section>

        {/* Dislikes */}
        <section className="mb-6">
          <p className="section-label">Nepatīk / izvairīties</p>
          <TagSelector
            options={dislikeOptions}
            selected={dislikes}
            onToggle={toggleDislike}
          />
        </section>

        {/* Free note */}
        <section className="mb-6">
          <p className="section-label">Piezīmes</p>
          <GlassCard>
            <textarea
              rows={3}
              placeholder="Ko vēl vajadzētu zināt? Alerģijas, sapņi, īpašas vēlmes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent text-white text-sm placeholder-white/25 outline-none resize-none leading-relaxed"
            />
          </GlassCard>
        </section>

        {/* Profile preview */}
        {name.trim() && (
          <section className="mb-6">
            <p className="section-label">Priekšskatījums</p>
            <GlassCard orange>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{avatar}</span>
                <div>
                  <p className="text-white font-semibold">{name}</p>
                  {age && <p className="text-white/40 text-xs">{age} gadi</p>}
                </div>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {interests.slice(0, 5).map((v) => {
                    const opt = interestOptions.find((o) => o.value === v)
                    return (
                      <span key={v} className="text-xs glass px-2 py-1 rounded-lg text-white/60">
                        {opt?.label}
                      </span>
                    )
                  })}
                  {interests.length > 5 && (
                    <span className="text-xs text-white/30">+{interests.length - 5}</span>
                  )}
                </div>
              )}
            </GlassCard>
          </section>
        )}
      </div>

      {/* Save button */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, rgba(15,10,0,0.95) 60%, transparent)' }}
      >
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]
            ${saved
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'btn-primary'
            }`}
        >
          <Check size={18} />
          {saved ? 'Saglabāts!' : 'Saglabāt profilu'}
        </button>
      </div>
    </div>
  )
}
