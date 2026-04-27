/**
 * RESCUE MODE — shown when mood is 'angry' or 'sad'.
 * Provides emergency recovery suggestions personalised by partner profile.
 */
import { useState } from 'react'
import { Heart, Copy, Check, MapPin, Phone } from 'lucide-react'

const FLOWER_SHOPS = [
  { name: 'Sakura Flowers',      address: 'Brīvības iela 75, Rīga',   phone: '+371 2234 5678', walk: '8 min' },
  { name: 'Ziedu Lielveikals',   address: 'Tērbatas iela 32, Rīga',   phone: '+371 2987 6543', walk: '12 min' },
  { name: 'Florist Aija',        address: 'Miera iela 14, Rīga',      phone: '+371 2741 0023', walk: '15 min' },
]

const CHOCOLATES = [
  { name: 'Laima Šokolāde',    note: 'Latvijas ikona — Mīļā Rīga 200g',     price: '€4' },
  { name: 'Laima Assortis',    note: 'Iecienītu saldumu izlase',              price: '€8' },
  { name: 'Rīgas Šokolāde',    note: 'Rūgtā ar bumbieriem — viņai mīļākā?', price: '€5' },
]

const QUIET_CAFES = [
  { name: 'Rocket Bean Roastery', address: 'Miera iela 34',     vibe: 'Mierīga, intīma gaisotne' },
  { name: 'Papardes Zieds',       address: 'Tērbatas iela 56',  vibe: 'Romantiska un klusa' },
  { name: 'Kafe Kafija',          address: 'Kalēju iela 22',    vibe: 'Sena Rīga, istabas sajūta' },
]

const MESSAGES = [
  'Es ļoti atvainojos. Tu man esi vissvarīgākā pasaulē. 💕',
  'Lai es tiktu sadzirdēts — tev ir taisnība, un es to apzinos.',
  'Šodien es gribu tikai būt ar tevi. Tu izvēlies — ko darām?',
  'Piedod man. Tavs smaids ir man viss.',
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="ml-auto shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
      style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.20)' }}
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-orange-500" />}
    </button>
  )
}

export default function RescueMode({ mood, partnerName }) {
  const [tab, setTab] = useState('flowers')
  const name = partnerName || 'viņai'
  const isSad = mood === 'sad'

  const tabs = [
    { id: 'flowers',   label: '🌷 Ziedi' },
    { id: 'chocolate', label: '🍫 Šokolāde' },
    { id: 'cafe',      label: '☕ Kafejnīca' },
    { id: 'message',   label: '💌 Vēstule' },
  ]

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.20)' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
          {isSad ? '🫂' : '🫶'}
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900">Glābšanas režīms</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isSad
              ? `Nesteidzies. Šeit ir veidi, kā uzlabot dienu ${name}.`
              : `Elpojam. Šeit ir ātrākais veids, kā situāciju labot ar ${name}.`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 gap-1 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
              tab === t.id
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-500'
            }`}
            style={tab !== t.id ? { background: 'rgba(0,0,0,0.05)' } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 space-y-2">
        {/* Flower shops */}
        {tab === 'flowers' && FLOWER_SHOPS.map((s) => (
          <div key={s.name} className="glass p-3 flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">🌷</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{s.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {s.address}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-orange-500 font-medium">🚶 {s.walk}</span>
                <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-xs text-gray-400">
                  <Phone size={10} /> {s.phone}
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Chocolates */}
        {tab === 'chocolate' && CHOCOLATES.map((c) => (
          <div key={c.name} className="glass p-3 flex items-center gap-3">
            <span className="text-xl shrink-0">🍫</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.note}</p>
            </div>
            <span className="text-sm font-bold text-orange-500 shrink-0">{c.price}</span>
          </div>
        ))}

        {/* Quiet cafes */}
        {tab === 'cafe' && QUIET_CAFES.map((c) => (
          <div key={c.name} className="glass p-3 flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">☕</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {c.address}
              </p>
              <p className="text-xs text-purple-500 mt-0.5">{c.vibe}</p>
            </div>
          </div>
        ))}

        {/* Message templates */}
        {tab === 'message' && (
          <>
            <p className="text-xs text-gray-400 px-1 pb-1">
              Kopē un nosūti {name} — vai pielāgo pats.
            </p>
            {MESSAGES.map((msg, i) => (
              <div key={i} className="glass p-3 flex items-start gap-2">
                <p className="text-xs text-gray-700 flex-1 leading-relaxed italic">"{msg}"</p>
                <CopyButton text={msg} />
              </div>
            ))}
          </>
        )}

        {/* Rescue tip */}
        <div className="flex items-start gap-2 pt-1">
          <Heart size={12} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Klausīšanās ir svarīgāka nekā kāda dāvana. Sākums — «Es saprotu, ka tu jūties...»
          </p>
        </div>
      </div>
    </div>
  )
}
