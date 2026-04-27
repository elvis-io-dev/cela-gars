import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import BlobBackground from '../components/BlobBackground'
import GlassCard from '../components/GlassCard'
import TagSelector from '../components/TagSelector'
import { useApp } from '../context/AppContext'
import { Check, Trash2 } from 'lucide-react'

const INTEREST_OPTIONS = [
  { value: 'nature',      label: '🌿 Daba' },
  { value: 'art',         label: '🎨 Māksla' },
  { value: 'food',        label: '🍽️ Ēdiens' },
  { value: 'music',       label: '🎵 Mūzika' },
  { value: 'history',     label: '🏰 Vēsture' },
  { value: 'sports',      label: '⚽ Sports' },
  { value: 'cinema',      label: '🎬 Kino' },
  { value: 'travel',      label: '✈️ Ceļošana' },
  { value: 'reading',     label: '📚 Lasīšana' },
  { value: 'cooking',     label: '👨‍🍳 Gatavošana' },
  { value: 'photography', label: '📷 Foto' },
  { value: 'yoga',        label: '🧘 Joga' },
]

const PERSONALITY_OPTIONS = [
  { value: 'adventurous', label: '🏔️ Piedzīvojumu meklētājs' },
  { value: 'calm',        label: '🌊 Mierīgs un pamatīgs' },
  { value: 'social',      label: '🎉 Sabiedrisks' },
  { value: 'creative',    label: '🎨 Radošs' },
  { value: 'intellectual',label: '🧠 Intelektuāls' },
  { value: 'humorous',    label: '😄 Humoristisks' },
  { value: 'romantic',    label: '🌹 Romantisks' },
  { value: 'sporty',      label: '🏃 Sportisks' },
]

const DISLIKE_OPTIONS = [
  { value: 'crowds',  label: '😤 Pūļi' },
  { value: 'loud',    label: '🔊 Trokšņainas vietas' },
  { value: 'spicy',   label: '🌶️ Pikants ēdiens' },
  { value: 'heights', label: '😰 Augstumi' },
  { value: 'cold',    label: '🥶 Aukstums' },
  { value: 'early',   label: '⏰ Agra celšanās' },
  { value: 'horror',  label: '👻 Šausmu žanrs' },
  { value: 'formal',  label: '👔 Formālas vietas' },
]

const AVATARS = ['👩', '👨', '🧑', '👱', '🧔', '👩‍🦰', '👩‍🦱', '🧕', '👲', '🎭']

export default function PartnerProfile() {
  const navigate = useNavigate()
  const { partnerProfile, savePartnerProfile } = useApp()

  const [name,            setName]            = useState(partnerProfile?.name        ?? '')
  const [age,             setAge]             = useState(partnerProfile?.age         ?? '')
  const [avatar,          setAvatar]          = useState(partnerProfile?.avatar      ?? '👩')
  const [interests,       setInterests]       = useState(partnerProfile?.interests   ?? [])
  const [personality,     setPersonality]     = useState(partnerProfile?.personality ?? [])
  const [dislikes,        setDislikes]        = useState(partnerProfile?.dislikes    ?? [])
  const [note,            setNote]            = useState(partnerProfile?.note        ?? '')
  const [saved,           setSaved]           = useState(false)
  const [showAvatarPicker,setShowAvatarPicker]= useState(false)

  const toggleArr = (setter) => (v) =>
    setter((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v])

  const completeness = [
    name.trim().length > 0,
    age.trim().length > 0,
    interests.length > 0,
    personality.length > 0,
    dislikes.length > 0,
  ].filter(Boolean).length

  const handleSave = () => {
    savePartnerProfile({ name, age, avatar, interests, personality, dislikes, note })
    setSaved(true)
    setTimeout(() => { setSaved(false); navigate(-1) }, 900)
  }

  const handleClear = () => {
    setName(''); setAge(''); setAvatar('👩')
    setInterests([]); setPersonality([]); setDislikes([]); setNote('')
    savePartnerProfile({})
  }

  return (
    <div className="flex flex-col min-h-dvh relative">
      <BlobBackground />
      <PageHeader
        title="Partnera profils"
        subtitle="Personalizē pieredzi"
        backTo="/"
        action={
          <button
            onClick={handleClear}
            className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(209,213,219,0.5)' }}
          >
            <Trash2 size={14} className="text-gray-400" />
          </button>
        }
      />

      <div className="page-scroll px-5 pb-36 relative z-10">

        {/* Completeness bar */}
        <div className="mt-5 mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">Profila pilnīgums</span>
            <span className="text-orange-500 font-semibold">{completeness}/5</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(completeness / 5) * 100}%`,
                background: 'linear-gradient(90deg, #F97316, #FBBF24)',
              }}
            />
          </div>
        </div>

        {/* Avatar + basic info */}
        <section className="mb-6">
          <p className="section-label">Pamatinformācija</p>
          <GlassCard>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowAvatarPicker((v) => !v)}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 active:scale-90 transition-transform glass-orange"
              >
                {avatar}
              </button>
              <div className="flex-1 space-y-3">
                <input
                  type="text" placeholder="Vārds" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none border-b border-gray-200 pb-2 focus:border-orange-400 transition-colors"
                />
                <input
                  type="number" placeholder="Vecums" value={age} min={16} max={99}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-sm outline-none border-b border-gray-200 pb-2 focus:border-orange-400 transition-colors"
                />
              </div>
            </div>

            {showAvatarPicker && (
              <div className="border-t pt-3" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                <p className="text-xs text-gray-400 mb-2">Izvēlies avatāru</p>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((e) => (
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
          <TagSelector options={INTEREST_OPTIONS} selected={interests} onToggle={toggleArr(setInterests)} />
          {interests.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">{interests.length} izvēlēts</p>
          )}
        </section>

        {/* Personality */}
        <section className="mb-6">
          <p className="section-label">Personības iezīmes</p>
          <TagSelector options={PERSONALITY_OPTIONS} selected={personality} onToggle={toggleArr(setPersonality)} />
        </section>

        {/* Dislikes */}
        <section className="mb-6">
          <p className="section-label">Nepatīk / izvairīties</p>
          <TagSelector options={DISLIKE_OPTIONS} selected={dislikes} onToggle={toggleArr(setDislikes)} />
        </section>

        {/* Note */}
        <section className="mb-6">
          <p className="section-label">Piezīmes</p>
          <GlassCard>
            <textarea
              rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Ko vēl vajadzētu zināt? Alerģijas, sapņi, īpašas vēlmes..."
              className="w-full bg-transparent text-gray-800 text-sm placeholder-gray-400 outline-none resize-none leading-relaxed"
            />
          </GlassCard>
        </section>

        {/* Preview */}
        {name.trim() && (
          <section className="mb-6">
            <p className="section-label">Priekšskatījums</p>
            <GlassCard orange>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{avatar}</span>
                <div>
                  <p className="text-gray-900 font-bold">{name}</p>
                  {age && <p className="text-gray-400 text-xs">{age} gadi</p>}
                </div>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {interests.slice(0, 5).map((v) => {
                    const opt = INTEREST_OPTIONS.find((o) => o.value === v)
                    return (
                      <span key={v} className="text-xs glass px-2 py-1 rounded-lg text-gray-600">
                        {opt?.label}
                      </span>
                    )
                  })}
                  {interests.length > 5 && (
                    <span className="text-xs text-gray-400">+{interests.length - 5}</span>
                  )}
                </div>
              )}
            </GlassCard>
          </section>
        )}
      </div>

      {/* Save button */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-5 z-20"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.98) 60%, transparent)' }}
      >
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]
            ${saved ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' : 'btn-primary'}`}
        >
          <Check size={18} />
          {saved ? 'Saglabāts!' : 'Saglabāt profilu'}
        </button>
      </div>
    </div>
  )
}
