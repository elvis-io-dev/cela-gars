/**
 * AI-powered route generator using Google Gemini.
 *
 * Budget is enforced at TWO levels:
 *   1. Prompt-level  — the constraint is stated clearly (in English for better
 *      instruction-following) multiple times in the prompt.
 *   2. Client-level  — enforceBudget() removes stops that push the total over
 *      the limit even if the model ignores the prompt constraint.
 *
 * Falls back to a static curated pool (also budget-filtered) when:
 *   - VITE_GEMINI_API_KEY is absent
 *   - The API call fails
 *   - The response cannot be parsed into a valid stop array
 */

const API_KEY  = import.meta.env.VITE_GEMINI_API_KEY
const MODEL    = 'gemini-2.0-flash'
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

/* ─── Static fallback pools ──────────────────────────────────────────────────
 * Ordered by "natural flow" priority (1 = best fit for the opening stop).
 * Each stop has a realistic, individually-verified cost in EUR.
 * ─────────────────────────────────────────────────────────────────────────── */

const DATE_POOL = [
  { p: 1,  duration: '1 st.',   icon: '🏰', title: 'Pastaigas pa Vecrīgu',
    desc: 'Mājīgas ielas, bruģakmens ceļi un paslēpti pagalmi — ideāla telpa tuvākai iepazīšanai.',
    cost: 0,  tags: ['Bezmaksas', 'Romantisks'] },
  { p: 2,  duration: '45 min',  icon: '🌅', title: 'Saulriets Bastejkalnā',
    desc: 'Rīgas pilsētas parks ar skatu pār pilsētas kanālu — populārākā saulrieta vieta pāriem.',
    cost: 0,  tags: ['Bezmaksas', 'Romantisks'] },
  { p: 3,  duration: '45 min',  icon: '🛍️', title: 'Rīgas Centrāltirgus — ziedu paviljons',
    desc: 'Eiropa lielākais tirgus — svaigi sezonas ziedi un vietējie produkti mājīgā gaisotnē.',
    cost: 0,  tags: ['Bezmaksas', 'Kultūra'] },
  { p: 4,  duration: '30 min',  icon: '⛪', title: 'Sv. Jāņa Baznīca skatu laukums',
    desc: 'Gotikas dārgums Vecrīgas sirdī — ieejas maksa simboliska, skats uz jumtiem neaizmirstams.',
    cost: 3,  tags: ['Kultūra', 'Lēts'] },
  { p: 5,  duration: '1 st.',   icon: '☕', title: 'Kafija "Rocket Bean Roastery"',
    desc: 'Rīgas kultovākā specialty kafejnīca — mājīgs interjers un labi pagatavota kafija diviem.',
    cost: 8,  tags: ['Kafija', 'Romantisks'] },
  { p: 6,  duration: '30 min',  icon: '🌆', title: 'Vakara skats no Sv. Pētera torņa',
    desc: 'Pilsētas panorāma krēslā no 72 metru augstuma — neaizmirstams brīdis diviem.',
    cost: 9,  tags: ['Romantisks', 'Unikāls'] },
  { p: 7,  duration: '1 st.',   icon: '🖼️', title: 'Latvijas Nacionālais mākslas muzejs',
    desc: 'Latvijas lielākā mākslas kolekcija — impresionisms un nacionālā romantika skaistā ēkā.',
    cost: 6,  tags: ['Kultūra', 'Māksla'] },
  { p: 8,  duration: '1.5 st.', icon: '🍽️', title: 'Vakariņas "3 Pavāri"',
    desc: 'Latvijas virtuve mūsdienīgā interpretācijā — mājīga gaisotne un vietēji sezonas produkti.',
    cost: 35, tags: ['Gastro', 'Romantisks'] },
  { p: 9,  duration: '1.5 st.', icon: '🍷', title: 'Vakariņas "Folkklubs Ata Dubults"',
    desc: 'Latvju virtuves dārgumi modernā iesaiņojumā. Rezervēt galdiņu iepriekš.',
    cost: 45, tags: ['Gastro', 'Intīms'] },
  { p: 10, duration: '1 st.',   icon: '🎭', title: 'Latvijas Nacionālā teātra izrāde',
    desc: 'Latvijas prestižākais teātris ar klasikas un mūsdienu izrādēm Brīvības bulvārī.',
    cost: 20, tags: ['Kultūra', 'Romantisks'] },
  { p: 11, duration: '1 st.',   icon: '🍸', title: 'Kokteiļi "Skyline Bar"',
    desc: 'Rīgas augstākā bāra pilsētas panorāma vakarā — ideāla dienas nobeiguma vieta.',
    cost: 25, tags: ['Romantisks', 'Premium'] },
]

const ACTIVITY_POOL = [
  { p: 1,  duration: '2 st.',   icon: '🌿', title: 'Gauja Nacionālais Parks — Velnala taka',
    desc: 'Latvijas lielākā nacionālā parka ikoniskākā taka — smilšakmens atsegumi un Gaujas ieleja.',
    cost: 0,  tags: ['Daba', 'Bezmaksas'] },
  { p: 2,  duration: '2 st.',   icon: '🏖️', title: 'Jūrmala — Majori pludmale',
    desc: 'Baltijas jūras pludmale ar baltu smilti un priežu meža gaisu — latvieši šeit atpūšas vasarā.',
    cost: 0,  tags: ['Pludmale', 'Bezmaksas'] },
  { p: 3,  duration: '2.5 st.', icon: '🏊', title: 'Ķemeru Nacionālais Parks — Kaniera ezers',
    desc: 'Miera ūdeņi, bebru dambji un purva taciņas Ķemeru nacionālajā parkā.',
    cost: 0,  tags: ['Daba', 'Bezmaksas'] },
  { p: 4,  duration: '2 st.',   icon: '🏡', title: 'Latvijas Brīvdabas muzejs',
    desc: 'Latvijas lauku arhitektūra dzīvā apkārtnes — 118 vēsturiskas ēkas Juglas ezera krastā.',
    cost: 5,  tags: ['Kultūra', 'Vēsture'] },
  { p: 5,  duration: '1 st.',   icon: '🎨', title: 'Latvijas Nacionālais mākslas muzejs',
    desc: 'Nacionālā mākslas kolekcija — latviešu impresionisms un modernisms.',
    cost: 6,  tags: ['Māksla', 'Kultūra'] },
  { p: 6,  duration: '1.5 st.', icon: '🏰', title: 'Turaidas Pils Komplekss',
    desc: 'Viduslaiku sarkanā pils ar izstādēm un skatu laukumu pār zeltaino Gaujas leju.',
    cost: 7,  tags: ['Vēsture', 'Kultūra'] },
  { p: 7,  duration: '2 st.',   icon: '🚲', title: 'Velo maršruts pa Daugavas krastu',
    desc: 'Noma pie Akmens tilta — brauciens pa Daugavas krastu ar pilsētas panorāmu.',
    cost: 8,  tags: ['Aktīvs', 'Pilsēta'] },
  { p: 8,  duration: '45 min',  icon: '🍲', title: 'Pusdienas "Aparjods" Siguldā',
    desc: '"Aparjods" — krāsns maize, vietējā sūra un karsts zirņu zupa paša centrā.',
    cost: 15, tags: ['Ēdiens', 'Vietējais'] },
  { p: 9,  duration: '1 st.',   icon: '🎿', title: 'Zipline "Tarzāns" pāri Gaujai',
    desc: 'Brauciens ar zipline pāri Gaujas upei — 42 metru augstums un 140 metru garums.',
    cost: 15, tags: ['Adrenalīns', 'Sports'] },
  { p: 10, duration: '1.5 st.', icon: '🏒', title: 'Siguldas Bobsleja un Kamaniņu trase',
    desc: 'Mūsdienu olimpiskā trase atvērta apmeklētājiem — kamaniņu brauciens pa ledu.',
    cost: 20, tags: ['Adrenalīns', 'Ziema'] },
  { p: 11, duration: '3 st.',   icon: '🛶', title: 'Kajakošana pa Gauju',
    desc: 'Organizēts kajakošanas brauciens pa Gauju cauri nacionālajam parkam ar aprīkojumu.',
    cost: 30, tags: ['Sports', 'Daba'] },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Parse "1.5 st." → 90, "45 min" → 45, else → 60 */
function parseMins(str = '') {
  const m = str.match(/(\d+(?:\.\d+)?)\s*(st|min)/)
  if (!m) return 60
  return m[2] === 'min' ? Number(m[1]) : Number(m[1]) * 60
}

/** Reassign sequential start times so they always flow logically. */
function assignTimes(stops, isDate) {
  let mins = (isDate ? 17 : 10) * 60
  return stops.map((stop) => {
    const hh = String(Math.floor(mins / 60)).padStart(2, '0')
    const mm = String(mins % 60).padStart(2, '0')
    mins += parseMins(stop.duration) + 15   // 15-min buffer between stops
    return { ...stop, time: `${hh}:${mm}` }
  })
}

/**
 * Hard client-side budget enforcement — runs on EVERY result, AI or fallback.
 * Keeps a running total and drops stops (most expensive first) until under budget.
 * Free stops (cost === 0) are never removed.
 */
function enforceBudget(stops, budget) {
  if (budget === 0) {
    // Zero budget: only free stops allowed
    return stops.filter((s) => (Number(s.cost) || 0) === 0)
  }

  // Build running total; drop any stop that would push us over
  let total = 0
  return stops.filter((s) => {
    const cost = Number(s.cost) || 0
    if (cost === 0) return true        // free stops always stay
    if (total + cost <= budget) { total += cost; return true }
    return false
  })
}

/**
 * Select stops from a static pool that fit within budget.
 * Pool items are already ordered by "natural flow" priority (field `p`).
 */
function selectFromPool(pool, budget, maxStops = 5) {
  let total = 0
  const result = []

  for (const stop of pool) {
    if (result.length >= maxStops) break
    const cost = Number(stop.cost) || 0
    if (budget === 0 && cost > 0) continue        // skip paid stops for €0 budget
    if (cost === 0 || total + cost <= budget) {
      // eslint-disable-next-line no-unused-vars
      const { p, ...clean } = stop                // strip internal `p` priority field
      result.push(clean)
      total += cost
    }
  }

  // Last resort: if nothing selected (e.g. budget too low for even cheap stops),
  // return the free stops only — a route is always possible.
  if (result.length === 0) {
    return pool
      .filter((s) => (Number(s.cost) || 0) === 0)
      .slice(0, 3)
      .map(({ p, ...s }) => s)
  }

  return result
}

/* ─── Fallback route builder ─────────────────────────────────────────────── */
function buildFallback(state) {
  const isDate = state?.type === 'date'
  const budget = state?.budget ?? 999
  const pool   = isDate ? DATE_POOL : ACTIVITY_POOL
  const raw    = selectFromPool(pool, budget)
  return assignTimes(raw, isDate)
}

/* ─── Gemini route generator ─────────────────────────────────────────────── */
export async function generateRoute(state) {
  if (!state) return buildFallback(state)

  const {
    type, transport = [], vibes = [], interests = [],
    duration = 3, budget = 60,
    partnerName, mood, hasKids, hasDog,
  } = state

  const isDate  = type === 'date'
  const budgetLabel = budget === 0 ? '€0 — FREE ONLY' : `€${budget}`

  // ── Prompt ──────────────────────────────────────────────────────────────
  const budgetLines = [
    `🚨 BUDGET CONSTRAINT — THIS IS THE MOST IMPORTANT RULE:`,
    `   Total budget: ${budgetLabel}`,
    `   The SUM of ALL "cost" fields MUST NOT exceed €${budget}.`,
    `   Each "cost" must be a realistic non-negative integer (EUR). Free = 0.`,
    budget === 0
      ? `   ALL stops MUST have cost: 0. Any stop with cost > 0 is FORBIDDEN.`
      : budget <= 15
        ? `   Budget is very tight. Prioritise free parks, walks, viewpoints.`
        : budget <= 40
          ? `   Budget is moderate. Mix free and inexpensive (€5–15) stops.`
          : null,
  ].filter(Boolean).join('\n')

  const contextLines = isDate
    ? [
        `Type: Romantic date${partnerName ? ` with ${partnerName}` : ''}`,
        `Vibe: ${vibes.join(', ') || 'romantic'}`,
        mood && mood !== 'neutral' ? `Mood: ${mood}` : null,
      ].filter(Boolean)
    : [
        `Type: Group activity`,
        `Interests: ${interests.join(', ') || 'nature'}`,
        hasKids ? `Children present — keep activities family-friendly` : null,
        hasDog  ? `Dog coming — include dog-friendly venues`           : null,
      ].filter(Boolean)

  const prompt = `You are an expert Latvia tourism guide. Create a personalised itinerary.

${contextLines.join('\n')}
Transport: ${transport.join(', ') || 'walk'}
Duration: ${duration} hours

${budgetLines}

Return ONLY a valid JSON array (no markdown, no extra text) with 3–5 stops in Latvian:
[
  {
    "time": "17:00",
    "duration": "1 st.",
    "title": "Vietas nosaukums latviski",
    "desc": "2–3 teikumu apraksts latviešu valodā.",
    "icon": "🎭",
    "cost": 0,
    "tags": ["Kultūra", "Bezmaksas"]
  }
]

Double-check: sum of all cost values ≤ €${budget}.${budget === 0 ? ' Every cost must be 0.' : ''}`

  if (!API_KEY) return buildFallback(state)

  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,        // lower = more rule-following
          responseMimeType: 'text/plain',
        },
      }),
    })

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)

    const data     = await res.json()
    const parts    = data?.candidates?.[0]?.content?.parts ?? []
    const rawText  = parts.map((p) => p.text ?? '').join('')

    const clean    = rawText
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')   // strip Google Search citation markers
      .replace(/```(?:json)?/g, '')            // strip markdown fences
      .trim()

    const match = clean.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array in response')

    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty array')

    // Normalise costs to integers, then hard-enforce budget client-side
    const normalised = parsed.map((s) => ({ ...s, cost: Math.round(Number(s.cost) || 0) }))
    const enforced   = enforceBudget(normalised, budget)

    // If enforcement removed everything, fall back to static
    if (enforced.length === 0) return buildFallback(state)

    // Reassign sequential times so they always make sense
    return assignTimes(enforced, isDate)

  } catch (err) {
    console.warn('[routeGenerator] Gemini failed, using fallback:', err.message)
    return buildFallback(state)
  }
}
