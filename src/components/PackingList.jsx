/**
 * PACKING LIST — smart "Ko paņemt līdzi" based on:
 *  - Real weather (temp, condition, windSpeed)
 *  - Activity type (date vs group activity)
 *  - Interests (hiking, beach, etc.)
 *  - Dog coming along
 */
import { useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'

function buildItems({ weather, isDate, interests = [], hasDog, season }) {
  const items = []
  const temp = weather?.temp ?? 15
  const condition = weather?.condition ?? 'cloudy'
  const wind = weather?.windSpeed ?? 10

  // ── Weather ──────────────────────────────────────────────
  if (temp < 5)
    items.push({ icon: '🧥', text: 'Silta ziemas jaka', cat: 'apģērbs', reason: `${temp}°C — ļoti auksts` })
  else if (temp < 12)
    items.push({ icon: '🧥', text: 'Jaka vai vestes', cat: 'apģērbs', reason: `${temp}°C — vēss` })
  else if (temp < 16)
    items.push({ icon: '👘', text: 'Vieglāka jaka', cat: 'apģērbs', reason: `${temp}°C — vēja apstākļi` })

  if (temp > 22)
    items.push({ icon: '🕶️', text: 'Saulesbrilles', cat: 'apģērbs', reason: 'Saulains' })
  if (temp > 22)
    items.push({ icon: '🧴', text: 'Sauļošanās krēms SPF 50', cat: 'kopšana', reason: `${temp}°C — UV risks` })

  if (condition === 'rainy')
    items.push({ icon: '☂️', text: 'Lietussargs', cat: 'apģērbs', reason: 'Lietus paredzēts' })
  if (condition === 'rainy')
    items.push({ icon: '👟', text: 'Ūdensnecaurlaidīgi apavi', cat: 'apģērbs', reason: 'Slapjas ielas' })

  if (wind > 30)
    items.push({ icon: '🧣', text: 'Šalle', cat: 'apģērbs', reason: `${wind} km/h vējš` })

  if (season === 'winter')
    items.push({ icon: '🧤', text: 'Cimdi', cat: 'apģērbs', reason: 'Ziemas sezona' })

  // ── Always ───────────────────────────────────────────────
  items.push({ icon: '💳', text: 'Maksiņš / banka karte', cat: 'finanses', reason: 'Vienmēr' })
  items.push({ icon: '📱', text: 'Uzlādēts telefons + power bank', cat: 'tehnika', reason: 'Navigācijai' })

  // ── Date-specific ─────────────────────────────────────────
  if (isDate) {
    items.push({ icon: '🌹', text: 'Neliela dāvana vai ziedi', cat: 'romantika', reason: 'Randiņam' })
    items.push({ icon: '💐', text: 'Smaržas / dezodorants', cat: 'kopšana', reason: 'Pirmais iespaids' })
    items.push({ icon: '🪞', text: 'Gludināta krekls / kleita', cat: 'apģērbs', reason: 'Izskatīties labi' })
  }

  // ── Activity-based ────────────────────────────────────────
  if (interests.includes('hiking') || interests.includes('nature')) {
    items.push({ icon: '🥾', text: 'Ērti pastaigu apavi', cat: 'apģērbs', reason: 'Pārgājiens' })
    items.push({ icon: '💧', text: 'Ūdens pudele 0.75L', cat: 'pārtika', reason: 'Hidratācijai' })
    items.push({ icon: '🎒', text: 'Neliela mugursoma', cat: 'somas', reason: 'Lietas nēsāšanai' })
  }

  if (interests.includes('beach')) {
    items.push({ icon: '🩴', text: 'Šļūcenes vai pludmales čības', cat: 'apģērbs', reason: 'Pludmale' })
    items.push({ icon: '🏊', text: 'Peldkostīms / peldbikses', cat: 'apģērbs', reason: 'Peldēšanai' })
    items.push({ icon: '🏖️', text: 'Dvielis', cat: 'apģērbs', reason: 'Pludmale' })
  }

  if (interests.includes('food') || isDate)
    items.push({ icon: '🍬', text: 'Piparmētra košļene', cat: 'kopšana', reason: 'Tuvuma brīžiem 😉' })

  if (interests.includes('photography'))
    items.push({ icon: '📷', text: 'Kamera vai uzlādēts telefons', cat: 'tehnika', reason: 'Piemiņas foto' })

  // ── Dog ──────────────────────────────────────────────────
  if (hasDog) {
    items.push({ icon: '🐕', text: 'Pavada', cat: 'suns', reason: 'Suns nāk līdz' })
    items.push({ icon: '💧', text: 'Ūdens bļoda un pudele sunim', cat: 'suns', reason: 'Suns jādzirdina' })
    items.push({ icon: '🛁', text: 'Higiēnas maisiņi', cat: 'suns', reason: 'Obligāti!' })
    items.push({ icon: '🍖', text: 'Suņa kārumi', cat: 'suns', reason: 'Labai uzvedībai' })
    if (condition === 'rainy')
      items.push({ icon: '🧺', text: 'Dvielis sunim', cat: 'suns', reason: 'Var samirkt' })
  }

  return items
}

const CAT_COLORS = {
  apģērbs:  'bg-blue-50   text-blue-600',
  kopšana:  'bg-pink-50   text-pink-600',
  finanses: 'bg-green-50  text-green-700',
  tehnika:  'bg-purple-50 text-purple-600',
  romantika:'bg-red-50    text-red-600',
  pārtika:  'bg-amber-50  text-amber-700',
  somas:    'bg-stone-100 text-stone-600',
  suns:     'bg-orange-50 text-orange-600',
}

export default function PackingList({ weather, isDate, interests, hasDog, season }) {
  const [open, setOpen]       = useState(false)
  const [checked, setChecked] = useState(new Set())

  const items = buildItems({ weather, isDate, interests, hasDog, season })
  const done  = checked.size

  const toggle = (i) =>
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  return (
    <section className="mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div>
          <p className="section-label mb-0 text-left">Ko paņemt līdzi</p>
          <p className="text-xs text-gray-400 mt-0.5">{done}/{items.length} sagatavots</p>
        </div>
        <div className="flex items-center gap-2">
          {done > 0 && (
            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
              {done} ✓
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(done / items.length) * 100}%`,
            background: done === items.length
              ? 'linear-gradient(90deg,#22C55E,#16A34A)'
              : 'linear-gradient(90deg,#F97316,#FBBF24)' }} />
      </div>

      {open && (
        <div className="space-y-2">
          {items.map((item, i) => {
            const isChecked = checked.has(i)
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`w-full glass p-3 flex items-center gap-3 text-left transition-all active:scale-[0.99]
                  ${isChecked ? 'opacity-50' : ''}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all
                  ${isChecked
                    ? 'bg-green-500 border-green-500'
                    : 'border-2 border-gray-200'}`}>
                  {isChecked && <Check size={12} className="text-white" />}
                </div>
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-400">{item.reason}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${CAT_COLORS[item.cat] ?? 'bg-gray-100 text-gray-500'}`}>
                  {item.cat}
                </span>
              </button>
            )
          })}

          {done === items.length && items.length > 0 && (
            <div className="glass p-3 flex items-center gap-3">
              <span className="text-xl">🎉</span>
              <p className="text-sm font-semibold text-green-600">Viss sagatavots! Lieliski!</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
