/**
 * AI-powered route generator using Google Gemini.
 *
 * Constraints enforced at every level:
 *
 *  1. TRANSPORT-AWARE RADIUS
 *     Effective radius = min(user slider, transport max)
 *       walk=3 km · bike=15 km · public=60 km · car=200 km
 *     This is sent to Gemini AND used to pre-filter the static pool.
 *
 *  2. DURATION-AWARE STOP COUNT
 *     ≤1.5 h → 1–2 stops · ≤3 h → 2–3 · ≤5 h → 3–4 · ≤7 h → 4–5 · >7 h → 5–6
 *     Gemini is told the exact range; pool selection honours the max.
 *
 *  3. HARD BUDGET CEILING
 *     Stated in the prompt (in English for better instruction-following).
 *     Client-side enforceBudget() removes stops that push total over limit
 *     regardless of what Gemini returns.
 *
 *  4. GEOGRAPHIC COHERENCE
 *     Prompt: all stops within effective radius of start, no stop more than
 *     15 km from any other stop.
 *     Pool: filterPoolByLocation uses haversine + coherence clustering.
 *
 *  Falls back to the static curated pool when:
 *    – VITE_GEMINI_API_KEY is absent
 *    – API call fails or response is un-parseable
 *    – Budget enforcement removes every AI-generated stop
 */

import {
  haversineKm,
  getCityCoords,
  citiesWithinRadius,
  getTransportEffectiveRadius,
} from '../utils/geography'

const API_KEY  = import.meta.env.VITE_GEMINI_API_KEY
const MODEL    = 'gemini-2.0-flash'
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

/* ─── Static fallback pools ─────────────────────────────────────────────────
 * Each entry:
 *   p        — natural-flow priority (lower = earlier in the day)
 *   location — canonical city name (must match CITY_DATA in geography.js)
 *   coords   — {lat,lon} for distance filtering
 *   cost     — realistic EUR (integer); 0 = free
 * ─────────────────────────────────────────────────────────────────────────── */

const DATE_POOL = [
  { p: 1,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🏰', title: 'Pastaigas pa Vecrīgu',
    desc: 'Mājīgas ielas, bruģakmens ceļi un paslēpti pagalmi — ideāla telpa tuvākai iepazīšanai.',
    cost: 0,  tags: ['Bezmaksas', 'Romantisks'] },

  { p: 2,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '45 min',  icon: '🌅', title: 'Saulriets Bastejkalnā',
    desc: 'Rīgas pilsētas parks ar skatu pār pilsētas kanālu — populārākā saulrieta vieta pāriem.',
    cost: 0,  tags: ['Bezmaksas', 'Romantisks'] },

  { p: 3,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '45 min',  icon: '🛍️', title: 'Rīgas Centrāltirgus',
    desc: 'Eiropa lielākais tirgus — svaigi sezonas ziedi un vietējie produkti mājīgā gaisotnē.',
    cost: 0,  tags: ['Bezmaksas', 'Kultūra'] },

  { p: 4,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '30 min',  icon: '⛪', title: 'Sv. Pētera baznīca — tornis',
    desc: 'Panorāma no 72 metru augstuma pār sarkaniem jumtiem — viena no labākajām Rīgas skatuves.',
    cost: 9,  tags: ['Kultūra', 'Romantisks'] },

  { p: 5,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '☕', title: 'Kafija "Rocket Bean Roastery"',
    desc: 'Rīgas kultovākā specialty kafejnīca — mājīgs interjers un labi pagatavota kafija diviem.',
    cost: 8,  tags: ['Kafija', 'Romantisks'] },

  { p: 6,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🖼️', title: 'Latvijas Nacionālais mākslas muzejs',
    desc: 'Latvijas lielākā mākslas kolekcija — impresionisms un nacionālā romantika skaistā ēkā.',
    cost: 6,  tags: ['Kultūra', 'Māksla'] },

  { p: 7,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1.5 st.', icon: '🍽️', title: 'Vakariņas "3 Pavāri"',
    desc: 'Latvijas virtuve mūsdienīgā interpretācijā — mājīga gaisotne un vietēji sezonas produkti.',
    cost: 35, tags: ['Gastro', 'Romantisks'] },

  { p: 8,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1.5 st.', icon: '🍷', title: 'Vakariņas "Folkklubs Ata Dubults"',
    desc: 'Latvju virtuves dārgumi modernā iesaiņojumā. Rezervēt galdiņu iepriekš.',
    cost: 45, tags: ['Gastro', 'Intīms'] },

  { p: 9,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🎭', title: 'Latvijas Nacionālā teātra izrāde',
    desc: 'Latvijas prestižākais teātris ar klasikas un mūsdienu izrādēm Brīvības bulvārī.',
    cost: 20, tags: ['Kultūra', 'Romantisks'] },

  { p: 10, location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🍸', title: 'Kokteiļi "Skyline Bar"',
    desc: 'Rīgas augstākā bāra pilsētas panorāma vakarā — ideāla dienas nobeiguma vieta.',
    cost: 25, tags: ['Romantisks', 'Premium'] },

  { p: 11, location: 'Jūrmala', coords: { lat: 56.968, lon: 23.771 },
    duration: '1.5 st.', icon: '🌊', title: 'Rietumu saullēkts Jūrmalā',
    desc: 'Majori pludmale vakarā — priežu gaiss un viļņi. 30 min ar vilcienu no Rīgas.',
    cost: 3,  tags: ['Romantisks', 'Daba'] },
]

const ACTIVITY_POOL = [
  { p: 1,  location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '2 st.',   icon: '🌿', title: 'Velnala taka — Gauja NP',
    desc: 'Latvijas lielākā nacionālā parka ikoniskākā taka — smilšakmens atsegumi un Gaujas ieleja.',
    cost: 0,  tags: ['Daba', 'Bezmaksas'] },

  { p: 2,  location: 'Jūrmala', coords: { lat: 56.968, lon: 23.771 },
    duration: '2 st.',   icon: '🏖️', title: 'Jūrmala — Majori pludmale',
    desc: 'Baltijas jūras pludmale ar baltu smilti un priežu meža gaisu.',
    cost: 0,  tags: ['Pludmale', 'Bezmaksas'] },

  { p: 3,  location: 'Ķemeri', coords: { lat: 56.925, lon: 23.490 },
    duration: '2.5 st.', icon: '🏊', title: 'Ķemeru NP — Kaniera ezers',
    desc: 'Miera ūdeņi, bebru dambji un purva taciņas Ķemeru nacionālajā parkā.',
    cost: 0,  tags: ['Daba', 'Bezmaksas'] },

  { p: 4,  location: 'Rīga',   coords: { lat: 56.990, lon: 24.234 },
    duration: '2 st.',   icon: '🏡', title: 'Latvijas Brīvdabas muzejs',
    desc: '118 vēsturiskas ēkas Juglas ezera krastā — Latvijas lauku arhitektūra dzīvā.',
    cost: 5,  tags: ['Kultūra', 'Vēsture'] },

  { p: 5,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🎨', title: 'Latvijas Nacionālais mākslas muzejs',
    desc: 'Nacionālā mākslas kolekcija — latviešu impresionisms un modernisms.',
    cost: 6,  tags: ['Māksla', 'Kultūra'] },

  { p: 6,  location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '1.5 st.', icon: '🏰', title: 'Turaidas pils komplekss',
    desc: 'Viduslaiku sarkanā pils ar izstādēm un skatu laukumu pār Gaujas leju.',
    cost: 7,  tags: ['Vēsture', 'Kultūra'] },

  { p: 7,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '2 st.',   icon: '🚲', title: 'Velo maršruts pa Daugavas krastu',
    desc: 'Noma pie Akmens tilta — brauciens pa Daugavas krastu ar pilsētas panorāmu.',
    cost: 8,  tags: ['Aktīvs', 'Pilsēta'] },

  { p: 8,  location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '45 min',  icon: '🍲', title: 'Pusdienas "Aparjods" Siguldā',
    desc: 'Krāsns maize, vietējā sūra un karsts zirņu zupa paša centrā.',
    cost: 15, tags: ['Ēdiens', 'Vietējais'] },

  { p: 9,  location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '1 st.',   icon: '🎿', title: 'Zipline "Tarzāns" pāri Gaujai',
    desc: 'Brauciens ar zipline pāri Gaujas upei — 42 m augstums, 140 m garums.',
    cost: 15, tags: ['Adrenalīns', 'Sports'] },

  { p: 10, location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '1.5 st.', icon: '🏒', title: 'Siguldas bobsleja trase',
    desc: 'Olimpiskā trase atvērta apmeklētājiem — kamaniņu brauciens pa ledu.',
    cost: 20, tags: ['Adrenalīns', 'Sports'] },

  { p: 11, location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '3 st.',   icon: '🛶', title: 'Kajakošana pa Gauju',
    desc: 'Organizēts kajakošanas brauciens cauri nacionālajam parkam ar aprīkojumu.',
    cost: 30, tags: ['Sports', 'Daba'] },
]

/* ─── Pure helpers ───────────────────────────────────────────────────────── */

/** Parse "1.5 st." → 90 min, "45 min" → 45, else → 60. */
function parseMins(str = '') {
  const m = str.match(/(\d+(?:\.\d+)?)\s*(st|min)/)
  if (!m) return 60
  return m[2] === 'min' ? Number(m[1]) : Number(m[1]) * 60
}

/** Sequential start times — dates start 17:00, activities 10:00. */
function assignTimes(stops, isDate) {
  let mins = (isDate ? 17 : 10) * 60
  return stops.map((stop) => {
    const hh = String(Math.floor(mins / 60)).padStart(2, '0')
    const mm = String(mins % 60).padStart(2, '0')
    mins += parseMins(stop.duration) + 15
    return { ...stop, time: `${hh}:${mm}` }
  })
}

/**
 * Hard client-side budget enforcement.
 * budget=0 → only free stops.
 * Free stops (cost===0) are always kept.
 */
function enforceBudget(stops, budget) {
  if (budget === 0) return stops.filter((s) => (Number(s.cost) || 0) === 0)
  let total = 0
  return stops.filter((s) => {
    const c = Number(s.cost) || 0
    if (c === 0) return true
    if (total + c <= budget) { total += c; return true }
    return false
  })
}

/**
 * How many stops fit in the given duration.
 * Returns {min, max} for the AI prompt; `max` used to cap pool selection.
 *
 *   ≤1.5 h → 1–2   (one focused experience)
 *   ≤3 h   → 2–3   (morning or afternoon outing)
 *   ≤5 h   → 3–4   (half day)
 *   ≤7 h   → 4–5   (full day)
 *   >7 h   → 5–6   (long day / weekend)
 */
function getStopRange(durationHours) {
  if (durationHours <= 1.5) return { min: 1, max: 2 }
  if (durationHours <= 3)   return { min: 2, max: 3 }
  if (durationHours <= 5)   return { min: 3, max: 4 }
  if (durationHours <= 7)   return { min: 4, max: 5 }
  return { min: 5, max: 6 }
}

/**
 * Compute effective max distance = min(user slider, transport ceiling).
 * Walking 50 km is nonsensical; this prevents it.
 */
function effectiveRadius(transport, userMaxKm) {
  return Math.min(userMaxKm, getTransportEffectiveRadius(transport))
}

/**
 * Filter pool to stops within maxDistanceKm of startCoords.
 * Then enforce geographic coherence: if the remaining stops span cities
 * more than 15 km apart, keep only the dominant cluster.
 */
function filterPoolByLocation(pool, startCoords, maxDistanceKm) {
  const nearby = pool.filter((stop) => {
    const d = haversineKm(startCoords.lat, startCoords.lon, stop.coords.lat, stop.coords.lon)
    return d <= maxDistanceKm
  })

  if (nearby.length === 0) return pool   // nothing close — use everything as fallback

  const cities = [...new Set(nearby.map((s) => s.location))]
  if (cities.length <= 1) return nearby

  // Check if any two included cities are > 15 km apart
  const cityCoords = cities.map((name) => ({ name, coords: getCityCoords(name) }))
  let needsCluster = false
  outer: for (let i = 0; i < cityCoords.length; i++) {
    for (let j = i + 1; j < cityCoords.length; j++) {
      const d = haversineKm(
        cityCoords[i].coords.lat, cityCoords[i].coords.lon,
        cityCoords[j].coords.lat, cityCoords[j].coords.lon,
      )
      if (d > 15) { needsCluster = true; break outer }
    }
  }
  if (!needsCluster) return nearby

  // Keep only the cluster with the most stops; tie-break: closest to start
  const counts = {}
  nearby.forEach((s) => { counts[s.location] = (counts[s.location] || 0) + 1 })
  const best = Object.entries(counts).sort(([aName, aC], [bName, bC]) => {
    if (bC !== aC) return bC - aC
    const { lat: aLat, lon: aLon } = getCityCoords(aName)
    const { lat: bLat, lon: bLon } = getCityCoords(bName)
    return haversineKm(startCoords.lat, startCoords.lon, aLat, aLon) -
           haversineKm(startCoords.lat, startCoords.lon, bLat, bLon)
  })[0][0]

  return nearby.filter((s) => s.location === best)
}

/** Greedy budget-aware stop selection from a pre-filtered, priority-sorted pool. */
function selectFromPool(pool, budget, maxStops = 5) {
  let total = 0
  const result = []

  for (const stop of pool) {
    if (result.length >= maxStops) break
    const cost = Number(stop.cost) || 0
    if (budget === 0 && cost > 0) continue
    if (cost === 0 || total + cost <= budget) {
      // eslint-disable-next-line no-unused-vars
      const { p, coords, ...clean } = stop
      result.push(clean)
      total += cost
    }
  }

  if (result.length === 0) {
    return pool
      .filter((s) => (Number(s.cost) || 0) === 0)
      .slice(0, 3)
      // eslint-disable-next-line no-unused-vars
      .map(({ p, coords, ...s }) => s)
  }
  return result
}

/* ─── Fallback builder ───────────────────────────────────────────────────── */

function buildFallback(state) {
  const isDate      = state?.type === 'date'
  const budget      = state?.budget      ?? 999
  const transport   = state?.transport   ?? []
  const duration    = state?.duration    ?? 3
  const startPlace  = state?.startPlace  ?? { name: 'Rīga', lat: 56.946, lon: 24.105 }
  const userMaxKm   = state?.maxDistance ?? 200
  const pool        = isDate ? DATE_POOL : ACTIVITY_POOL

  const startCoords = (startPlace.lat != null && startPlace.lon != null)
    ? { lat: startPlace.lat, lon: startPlace.lon }
    : getCityCoords(startPlace.name ?? 'Rīga')

  const maxKm       = effectiveRadius(transport, userMaxKm)
  const { max }     = getStopRange(duration)
  const filtered    = filterPoolByLocation(pool, startCoords, maxKm)
  const selected    = selectFromPool(filtered, budget, max)
  return assignTimes(selected, isDate)
}

/* ─── Gemini route generator ─────────────────────────────────────────────── */

export async function generateRoute(state) {
  if (!state) return buildFallback(state)

  const {
    type, transport = [], vibes = [], interests = [],
    duration = 3, budget = 60,
    partnerName, mood, hasKids, hasDog,
    startPlace = { name: 'Rīga', lat: 56.946, lon: 24.105 },
    maxDistance = 200,
  } = state

  const isDate      = type === 'date'
  const startName   = startPlace.name ?? 'Rīga'
  const startCoords = (startPlace.lat != null && startPlace.lon != null)
    ? { lat: startPlace.lat, lon: startPlace.lon }
    : getCityCoords(startName)

  // ── Effective constraints ──────────────────────────────────
  const maxKm       = effectiveRadius(transport, maxDistance)
  const stopRange   = getStopRange(duration)

  // Transport label for the prompt
  const transportMaxLabels = {
    walk: '3 km (walking — only nearby attractions)',
    bike: '15 km (cycling — city and immediate suburbs)',
    public: '60 km (public transit — regional)',
    car: '200 km (car — all Latvia)',
  }
  const dominantTransport = transport.includes('car')    ? 'car'
                          : transport.includes('public') ? 'public'
                          : transport.includes('bike')   ? 'bike'
                          : 'walk'
  const transportRadiusNote = transportMaxLabels[dominantTransport]

  // ── Allowed cities for this radius ────────────────────────
  const allowedCities = citiesWithinRadius(startName, maxKm)
    .map((c) => (c.km === 0 ? c.name : `${c.name} (~${c.km} km)`))
    .slice(0, 10)

  // ── Budget lines ───────────────────────────────────────────
  const budgetLabel = budget === 0 ? '€0 — FREE activities ONLY' : `€${budget}`
  const budgetLines = [
    `🚨 HARD BUDGET RULE — MOST IMPORTANT:`,
    `   Total budget: ${budgetLabel}`,
    `   SUM of ALL "cost" fields MUST NOT exceed €${budget}.`,
    `   "cost" = realistic non-negative integer EUR. Free = 0.`,
    budget === 0
      ? `   EVERY stop MUST have cost: 0. Paid stops are FORBIDDEN.`
      : budget <= 15
        ? `   Very tight — use free parks, viewpoints, walks only.`
        : budget <= 40
          ? `   Moderate — mix free stops with 1–2 inexpensive (€5–15) options.`
          : null,
  ].filter(Boolean).join('\n')

  // ── Type / preference context ──────────────────────────────
  const contextLines = isDate
    ? [
        `Type: Romantic date${partnerName ? ` with ${partnerName}` : ''}.`,
        `Vibe: ${vibes.join(', ') || 'romantic'}.`,
        mood && mood !== 'neutral' ? `Partner mood today: ${mood} — adjust suggestions accordingly.` : null,
      ].filter(Boolean)
    : [
        `Type: Group activity outing.`,
        `Interests: ${interests.join(', ') || 'nature'}.`,
        hasKids ? `Children present — all activities MUST be family-friendly.` : null,
        hasDog  ? `Dog coming — only dog-friendly outdoor venues.` : null,
      ].filter(Boolean)

  const prompt = `You are an expert Latvia tourism guide creating a ${isDate ? 'romantic date' : 'group activity'} itinerary.

${contextLines.join('\n')}
Transport: ${transport.join(', ') || 'walk'}.
Duration: ${duration} hours total.

🗺️ LOCATION RULES (STRICTLY MANDATORY):
   Start point: ${startName}
   Transport type: ${transport.join('/')} → max radius ${transportRadiusNote}
   Hard distance limit: ${maxKm} km from ${startName}.
   Allowed cities/areas: ${allowedCities.length > 0 ? allowedCities.join(', ') : 'Only within ' + maxKm + ' km of ' + startName}.
   ❌ NEVER suggest places outside ${maxKm} km from ${startName}.
   ❌ NEVER mix stops from opposite ends of Latvia.
   ❌ No stop may be more than 15 km from any other stop in the route.
   ✅ All stops must form a logical, walkable/driveable cluster.

⏱️ STOP COUNT RULE:
   With ${duration} hours available, include EXACTLY ${stopRange.min}–${stopRange.max} stops.
   Each stop needs realistic duration. The total duration of all stops must fit in ${duration} hours.

${budgetLines}

Each stop MUST have a "location" field with the Latvian city/district name (e.g. "Rīga", "Sigulda", "Jūrmala").

Return ONLY a valid JSON array (no markdown, no text outside brackets):
[
  {
    "time": "17:00",
    "duration": "1 st.",
    "title": "Vietas nosaukums latviski",
    "desc": "2–3 teikumu apraksts latviešu valodā. Konkrēta adrese vai orientieri.",
    "icon": "🎭",
    "cost": 0,
    "location": "Rīga",
    "tags": ["Kultūra", "Bezmaksas"]
  }
]

✅ Final checks:
  – Stop count: ${stopRange.min}–${stopRange.max}
  – All stops within ${maxKm} km of ${startName}
  – No stop more than 15 km from neighbours
  – Sum of costs ≤ €${budget}${budget === 0 ? ' (every cost must be exactly 0)' : ''}`

  if (!API_KEY) return buildFallback(state)

  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.35, responseMimeType: 'text/plain' },
      }),
    })

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)

    const data    = await res.json()
    const parts   = data?.candidates?.[0]?.content?.parts ?? []
    const rawText = parts.map((p) => p.text ?? '').join('')

    const clean = rawText
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')   // remove citation markers [1], [2,3]
      .replace(/```(?:json)?/g, '')
      .trim()

    const match = clean.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array in response')

    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty array')

    // Normalise costs
    const normalised = parsed.map((s) => ({ ...s, cost: Math.round(Number(s.cost) || 0) }))

    // Client-side geographic filter: drop stops outside effective radius
    const geoFiltered = normalised.filter((s) => {
      if (!s.location) return true  // no location field → trust the AI
      const coords = getCityCoords(s.location)
      const dist   = haversineKm(startCoords.lat, startCoords.lon, coords.lat, coords.lon)
      return dist <= maxKm + 5  // 5 km tolerance for suburb/district names
    })

    // Hard budget enforcement
    const enforced = enforceBudget(geoFiltered.length > 0 ? geoFiltered : normalised, budget)
    if (enforced.length === 0) return buildFallback(state)

    // Trim to stop count
    const trimmed = enforced.slice(0, stopRange.max)

    return assignTimes(trimmed, isDate)

  } catch (err) {
    console.warn('[routeGenerator] Gemini failed, using fallback:', err.message)
    return buildFallback(state)
  }
}
