/**
 * DATE IDEA SUBMISSION
 * - Users submit date ideas for Latvia
 * - OpenAI checks for duplicates against localStorage store
 * - Unique ideas enter a quarterly lottery (prizes: premium sub or Laima box)
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import BlobBackground from '../components/BlobBackground'
import GlassCard from '../components/GlassCard'
import { Send, Trophy, Clock, Sparkles, AlertCircle, Check } from 'lucide-react'

const STORE_KEY = 'celagars_ideas'
const API_KEY   = import.meta.env.VITE_OPENAI_API_KEY

const CATEGORIES = [
  { value: 'romantisks', label: '🌹 Romantisks' },
  { value: 'piedzivjums', label: '🏔️ Piedzīvojums' },
  { value: 'gastro', label: '🍽️ Gastro' },
  { value: 'kultūra', label: '🎭 Kultūra' },
  { value: 'daba', label: '🌿 Daba' },
  { value: 'sports', label: '⚽ Sports' },
]

function loadIdeas() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]') }
  catch { return [] }
}

function saveIdea(idea) {
  const ideas = loadIdeas()
  ideas.push({ ...idea, id: Date.now(), submittedAt: new Date().toISOString() })
  localStorage.setItem(STORE_KEY, JSON.stringify(ideas))
}

/** Next quarterly lottery draw date */
function getNextDraw() {
  const now = new Date()
  const y   = now.getFullYear()
  const quarterStarts = [0, 3, 6, 9].map((m) => new Date(y, m, 1))
  const future = quarterStarts.find((d) => d > now)
  return future ?? new Date(y + 1, 0, 1)
}

function daysUntil(date) {
  return Math.ceil((date - new Date()) / 86400000)
}

/** Use OpenAI to check if the idea is too similar to existing ones */
async function checkDuplicate(title, description, existing) {
  if (!API_KEY || existing.length === 0) return { similar: false }

  const existingList = existing.slice(-20).map((i) => `"${i.title}"`).join(', ')
  const prompt = `You are checking if a Latvian date idea is too similar to existing ones.

New idea: "${title}" — ${description}

Existing ideas: ${existingList}

Is the new idea clearly the same concept as any existing idea?
Respond ONLY with valid JSON (no markdown): {"similar": true or false, "similarTo": "matching title or null", "reason": "short reason in Latvian"}`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 120,
      }),
    })
    if (!res.ok) return { similar: false }
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? '{}'
    const clean = text.replace(/```(?:json)?/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return { similar: false }
  }
}

/* ── Lottery info card ─────────────────────────────────────── */
function LotteryCard() {
  const draw      = getNextDraw()
  const days      = daysUntil(draw)
  const drawLabel = draw.toLocaleDateString('lv-LV', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="rounded-2xl p-4 mb-6"
      style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(251,191,36,0.08))',
               border: '1px solid rgba(249,115,22,0.25)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
          🏆
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">Ceļa Gars Loterija</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Katru ceturksni izlozējam 3 uzvarētājus no visām iesniegtajām idejām.
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { icon: '⭐', label: 'Premium abonements', sub: '6 mēneši bez maksas' },
              { icon: '🍫', label: 'Laima šokolādes kaste', sub: 'Piegāde uz mājām' },
            ].map((p) => (
              <div key={p.label} className="glass rounded-xl p-2.5">
                <span className="text-lg">{p.icon}</span>
                <p className="text-xs font-semibold text-gray-800 mt-1">{p.label}</p>
                <p className="text-[10px] text-gray-400">{p.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            <Clock size={12} className="text-orange-500" />
            <span className="text-xs text-gray-500">
              Nākamā izloze: <strong className="text-orange-600">{drawLabel}</strong>
            </span>
            <span className="text-xs text-orange-500 font-bold ml-auto">{days} d.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Previous submissions ──────────────────────────────────── */
function MyIdeas({ ideas }) {
  if (!ideas.length) return null
  return (
    <section className="mb-6">
      <p className="section-label">Manas iesniegtas idejas</p>
      <div className="space-y-2">
        {ideas.slice(-3).reverse().map((idea) => (
          <div key={idea.id} className="glass p-3 flex items-center gap-3">
            <span className="text-lg shrink-0">
              {CATEGORIES.find((c) => c.value === idea.category)?.label.split(' ')[0] ?? '💡'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{idea.title}</p>
              <p className="text-xs text-gray-400">{new Date(idea.submittedAt).toLocaleDateString('lv-LV')}</p>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
              Loterija ✓
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── Main page ─────────────────────────────────────────────── */
export default function DateIdeaSubmit() {
  const navigate = useNavigate()

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [location,    setLocation]    = useState('')
  const [category,    setCategory]    = useState('')
  const [submitter,   setSubmitter]   = useState('')
  const [email,       setEmail]       = useState('')

  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState(null)   // 'success' | 'duplicate' | 'error'
  const [dupInfo,     setDupInfo]     = useState(null)
  const [myIdeas,     setMyIdeas]     = useState(loadIdeas)

  const canSubmit = title.trim().length > 5 && description.trim().length > 10 && category && location.trim()

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setResult(null)

    const existing = loadIdeas()
    const check = await checkDuplicate(title, description, existing)

    if (check.similar) {
      setDupInfo(check)
      setResult('duplicate')
      setLoading(false)
      return
    }

    // Unique — save to lottery
    const idea = { title, description, location, category, submitter, email }
    saveIdea(idea)
    setMyIdeas(loadIdeas())
    setResult('success')
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-dvh relative">
      <BlobBackground />
      <PageHeader
        title="Iesniegt randiņa ideju"
        subtitle="Iegūsti iespēju laimēt balvas"
        backTo="/"
      />

      <div className="page-scroll px-5 pb-32 relative z-10 mt-4">

        <LotteryCard />
        <MyIdeas ideas={myIdeas} />

        {/* Success state */}
        {result === 'success' && (
          <div className="rounded-2xl p-5 mb-6 flex flex-col items-center text-center"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-3">🎉</div>
            <p className="font-bold text-gray-900 text-base">Ideja pieņemta!</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              <strong className="text-green-600">"{title}"</strong> ir iekļauta nākamajā lotērijā.
              Veiksmi!
            </p>
            <button onClick={() => { setResult(null); setTitle(''); setDescription(''); setLocation(''); setCategory('') }}
              className="mt-4 text-xs text-orange-500 font-semibold">
              Iesniegt vēl vienu ideju →
            </button>
          </div>
        )}

        {/* Duplicate warning */}
        {result === 'duplicate' && (
          <div className="rounded-2xl p-4 mb-6"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Līdzīga ideja jau pastāv</p>
                {dupInfo?.similarTo && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Līdzīga: <em>"{dupInfo.similarTo}"</em>
                  </p>
                )}
                {dupInfo?.reason && (
                  <p className="text-xs text-gray-500 mt-1">{dupInfo.reason}</p>
                )}
                <button onClick={() => setResult(null)}
                  className="mt-2 text-xs text-orange-500 font-semibold">
                  Pielāgot ideju →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {result !== 'success' && (
          <GlassCard className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1.5 font-medium">Idejas nosaukums *</p>
              <input
                type="text"
                placeholder="Piemēram: Suņu pastaigas foto sesija Mežaparkā"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="w-full bg-transparent text-gray-800 placeholder-gray-300 text-sm outline-none border-b border-gray-100 pb-2 focus:border-orange-300 transition-colors"
              />
              <p className="text-[10px] text-gray-300 mt-1 text-right">{title.length}/80</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1.5 font-medium">Apraksts *</p>
              <textarea
                rows={3}
                placeholder="Ko darīt, kur aiziet, kāpēc tas ir īpašs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                className="w-full bg-transparent text-gray-800 placeholder-gray-300 text-sm outline-none resize-none leading-relaxed"
              />
              <p className="text-[10px] text-gray-300 text-right">{description.length}/300</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1.5 font-medium">Vieta Latvijā *</p>
              <input
                type="text"
                placeholder="Rīga, Sigulda, Jūrmala..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-gray-800 placeholder-gray-300 text-sm outline-none border-b border-gray-100 pb-2 focus:border-orange-300 transition-colors"
              />
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Kategorija *</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c.value} onClick={() => setCategory(c.value)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95
                      ${category === c.value ? 'glass-orange text-orange-600' : 'glass text-gray-500'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <p className="text-xs text-gray-400 mb-3 font-medium">Kontaktinformācija (loterijas vajadzībām)</p>
              <div className="space-y-3">
                <input type="text" placeholder="Vārds (pēc izvēles)" value={submitter}
                  onChange={(e) => setSubmitter(e.target.value)}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-300 text-sm outline-none border-b border-gray-100 pb-2 focus:border-orange-300 transition-colors" />
                <input type="email" placeholder="E-pasts (pēc izvēles)" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-300 text-sm outline-none border-b border-gray-100 pb-2 focus:border-orange-300 transition-colors" />
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* CTA */}
      {result !== 'success' && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-5 z-20"
          style={{ background: 'linear-gradient(to top,rgba(255,255,255,0.98) 60%,transparent)' }}
        >
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${canSubmit && !loading ? 'btn-primary' : 'text-gray-400 cursor-not-allowed'}`}
            style={(!canSubmit || loading) ? { background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' } : {}}
          >
            {loading ? (
              <><Sparkles size={18} className="animate-spin" /> AI pārbauda...</>
            ) : (
              <><Send size={18} /> Iesniegt ideju</>
            )}
          </button>
          {!canSubmit && (
            <p className="text-center text-xs text-gray-400 mt-2">Aizpildi nosaukumu, aprakstu, vietu un kategoriju</p>
          )}
        </div>
      )}
    </div>
  )
}
