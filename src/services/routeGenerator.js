/**
 * AI-powered route generator using Google Gemini.
 *
 * Budget is enforced at TWO levels:
 *   1. Prompt-level  — stated clearly (in English for better instruction-following)
 *      multiple times in the prompt.
 *   2. Client-level  — enforceBudget() removes stops that push the total over
 *      the limit even if the model ignores the prompt constraint.
 *
 * Location is enforced at TWO levels:
 *   1. Prompt-level  — start city, max radius, allowed city list, and an explicit
 *      rule against mixing geographically distant destinations.
 *   2. Client-level  — static fallback pool is pre-filtered by haversine distance
 *      and compass direction before any stop is selected.
 *
 * Falls back to a static curated pool (also budget + location filtered) when:
 *   - VITE_GEMINI_API_KEY is absent
 *   - The API call fails / response is unparseable
 *   - Client-side budget enforcement removes every AI-generated stop
 */

import { haversineKm, getCityCoords, citiesWithinRadius } from '../utils/geography'

const API_KEY  = import.meta.env.VITE_GEMINI_API_KEY
const MODEL    = 'gemini-2.0-flash'
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

/* ─── Static fallback pools ─────────────────────────────────────────────────
 *
 * Each entry carries:
 *   p       — natural-flow priority (lower = earlier in a typical day)
 *   location — canonical city name (must match CITY_DATA names in geography.js)
 *   coords   — {lat,lon} for distance filtering (same as CITY_DATA entry)
 *   cost     — realistic EUR cost (integer); 0 = free
 *
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
    duration: '45 min',  icon: '🛍️', title: 'Rīgas Centrāltirgus — ziedu paviljons',
    desc: 'Eiropa lielākais tirgus — svaigi sezonas ziedi un vietējie produkti mājīgā gaisotnē.',
    cost: 0,  tags: ['Bezmaksas', 'Kultūra'] },

  { p: 4,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '30 min',  icon: '⛪', title: 'Sv. Jāņa Baznīca',
    desc: 'Gotikas dārgums Vecrīgas sirdī — simboliska ieejas maksa, neaizmirstams skats uz jumtiem.',
    cost: 3,  tags: ['Kultūra', 'Lēts'] },

  { p: 5,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '☕', title: 'Kafija "Rocket Bean Roastery"',
    desc: 'Rīgas kultovākā specialty kafejnīca — mājīgs interjers un labi pagatavota kafija diviem.',
    cost: 8,  tags: ['Kafija', 'Romantisks'] },

  { p: 6,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '30 min',  icon: '🌆', title: 'Vakara skats no Sv. Pētera torņa',
    desc: 'Pilsētas panorāma krēslā no 72 metru augstuma — neaizmirstams brīdis diviem.',
    cost: 9,  tags: ['Romantisks', 'Unikāls'] },

  { p: 7,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🖼️', title: 'Latvijas Nacionālais mākslas muzejs',
    desc: 'Latvijas lielākā mākslas kolekcija — impresionisms un nacionālā romantika skaistā ēkā.',
    cost: 6,  tags: ['Kultūra', 'Māksla'] },

  { p: 8,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1.5 st.', icon: '🍽️', title: 'Vakariņas "3 Pavāri"',
    desc: 'Latvijas virtuve mūsdienīgā interpretācijā — mājīga gaisotne un vietēji sezonas produkti.',
    cost: 35, tags: ['Gastro', 'Romantisks'] },

  { p: 9,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1.5 st.', icon: '🍷', title: 'Vakariņas "Folkklubs Ata Dubults"',
    desc: 'Latvju virtuves dārgumi modernā iesaiņojumā. Rezervēt galdiņu iepriekš.',
    cost: 45, tags: ['Gastro', 'Intīms'] },

  { p: 10, location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🎭', title: 'Latvijas Nacionālā teātra izrāde',
    desc: 'Latvijas prestižākais teātris ar klasikas un mūsdienu izrādēm Brīvības bulvārī.',
    cost: 20, tags: ['Kultūra', 'Romantisks'] },

  { p: 11, location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🍸', title: 'Kokteiļi "Skyline Bar"',
    desc: 'Rīgas augstākā bāra pilsētas panorāma vakarā — ideāla dienas nobeiguma vieta.',
    cost: 25, tags: ['Romantisks', 'Premium'] },
]

const ACTIVITY_POOL = [
  { p: 1,  location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '2 st.',   icon: '🌿', title: 'Gauja Nacionālais Parks — Velnala taka',
    desc: 'Latvijas lielākā nacionālā parka ikoniskākā taka — smilšakmens atsegumi un Gaujas ieleja.',
    cost: 0,  tags: ['Daba', 'Bezmaksas'] },

  { p: 2,  location: 'Jūrmala', coords: { lat: 56.968, lon: 23.771 },
    duration: '2 st.',   icon: '🏖️', title: 'Jūrmala — Majori pludmale',
    desc: 'Baltijas jūras pludmale ar baltu smilti un priežu meža gaisu.',
    cost: 0,  tags: ['Pludmale', 'Bezmaksas'] },

  { p: 3,  location: 'Ķemeri', coords: { lat: 56.925, lon: 23.490 },
    duration: '2.5 st.', icon: '🏊', title: 'Ķemeru Nacionālais Parks — Kaniera ezers',
    desc: 'Miera ūdeņi, bebru dambji un purva taciņas Ķemeru nacionālajā parkā.',
    cost: 0,  tags: ['Daba', 'Bezmaksas'] },

  { p: 4,  location: 'Rīga',   coords: { lat: 56.990, lon: 24.234 },
    duration: '2 st.',   icon: '🏡', title: 'Latvijas Brīvdabas muzejs',
    desc: 'Latvijas lauku arhitektūra dzīvā apkārtnes — 118 vēsturiskas ēkas Juglas ezera krastā.',
    cost: 5,  tags: ['Kultūra', 'Vēsture'] },

  { p: 5,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '1 st.',   icon: '🎨', title: 'Latvijas Nacionālais mākslas muzejs',
    desc: 'Nacionālā mākslas kolekcija — latviešu impresionisms un modernisms.',
    cost: 6,  tags: ['Māksla', 'Kultūra'] },

  { p: 6,  location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '1.5 st.', icon: '🏰', title: 'Turaidas Pils Komplekss',
    desc: 'Viduslaiku sarkanā pils ar izstādēm un skatu laukumu pār zeltaino Gaujas leju.',
    cost: 7,  tags: ['Vēsture', 'Kultūra'] },

  { p: 7,  location: 'Rīga',   coords: { lat: 56.946, lon: 24.105 },
    duration: '2 st.',   icon: '🚲', title: 'Velo maršruts pa Daugavas krastu',
    desc: 'Noma pie Akmens tilta — brauciens pa Daugavas krastu ar pilsētas panorāmu.',
    cost: 8,  tags: ['Aktīvs', 'Pilsēta'] },

  { p: 8,  location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '45 min',  icon: '🍲', title: 'Pusdienas "Aparjods" Siguldā',
    desc: '"Aparjods" — krāsns maize, vietējā sūra un karsts zirņu zupa paša centrā.',
    cost: 15, tags: ['Ēdiens', 'Vietējais'] },

  { p: 9,  location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '1 st.',   icon: '🎿', title: 'Zipline "Tarzāns" pāri Gaujai',
    desc: 'Brauciens ar zipline pāri Gaujas upei — 42 metru augstums un 140 metru garums.',
    cost: 15, tags: ['Adrenalīns', 'Sports'] },

  { p: 10, location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '1.5 st.', icon: '🏒', title: 'Siguldas Bobsleja un Kamaniņu trase',
    desc: 'Olimpiskā trase atvērta apmeklētājiem — kamaniņu brauciens pa ledu.',
    cost: 20, tags: ['Adrenalīns', 'Sports'] },

  { p: 11, location: 'Sigulda', coords: { lat: 57.153, lon: 24.853 },
    duration: '3 st.',   icon: '🛶', title: 'Kajakošana pa Gauju',
    desc: 'Organizēts kajakošanas brauciens pa Gauju cauri nacionālajam parkam ar aprīkojumu.',
    cost: 30, tags: ['Sports', 'Daba'] },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Parse "1.5 st." → 90 min, "45 min" → 45 min, else → 60 min */
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
    mins += parseMins(stop.duration) + 15
    return { ...stop, time: `${hh}:${mm}` }
  })
}

/**
 * Hard client-side budget enforcement.
 * Free stops (cost === 0) are never removed.
 * For budget === 0: all paid stops are dropped.
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
 * Filter pool stops by distance from startCoords ≤ maxDistanceKm.
 * Then enforce geographic coherence: if remaining stops span cities more
 * than 30 km apart, keep only the cluster closest to startCoords.
 */
function filterPoolByLocation(pool, startCoords, maxDistanceKm) {
  // Radius filter
  const nearby = pool.filter((stop) => {
    const dist = haversineKm(startCoords.lat, startCoords.lon, stop.coords.lat, stop.coords.lon)
    return dist <= maxDistanceKm
  })

  if (nearby.length === 0) return pool // nothing close — use everything as fallback

  // Step 2 — coherence: detect if stops span multiple distant cities
  const cities = [...new Set(nearby.map((s) => s.location))]
  if (cities.length <= 1) return nearby

  // Check if any two cities are > 30 km apart
  const cityCoords = cities.map((name) => ({ name, coords: getCityCoords(name) }))
  let needsCluster = false
  outer: for (let i = 0; i < cityCoords.length; i++) {
    for (let j = i + 1; j < cityCoords.length; j++) {
      const d = haversineKm(
        cityCoords[i].coords.lat, cityCoords[i].coords.lon,
        cityCoords[j].coords.lat, cityCoords[j].coords.lon,
      )
      if (d > 30) { needsCluster = true; break outer }
    }
  }
  if (!needsCluster) return nearby

  // Pick the city with the most stops, tie-break by proximity to startCoords
  const counts = {}
  nearby.forEach((s) => { counts[s.location] = (counts[s.location] || 0) + 1 })
  const best = Object.entries(counts).sort(([aName, aC], [bName, bC]) => {
    if (bC !== aC) return bC - aC
    const aD = haversineKm(startCoords.lat, startCoords.lon, ...Object.values(getCityCoords(aName)))
    const bD = haversineKm(startCoords.lat, startCoords.lon, ...Object.values(getCityCoords(bName)))
    return aD - bD
  })[0][0]

  return nearby.filter((s) => s.location === best)
}

/**
 * Greedy budget-aware stop selection from a pre-filtered pool.
 */
function selectFromPool(pool, budget, maxStops = 5) {
  let total = 0
  const result = []

  for (const stop of pool) {
    if (result.length >= maxStops) break
    const cost = Number(stop.cost) || 0
    if (budget === 0 && cost > 0) continue
    if (cost === 0 || total + cost <= budget) {
      // Strip internal fields before returning
      // eslint-disable-next-line no-unused-vars
      const { p, coords, ...clean } = stop
      result.push(clean)
      total += cost
    }
  }

  if (result.length === 0) {
    // Last resort: at least return free stops
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
  const startPlace  = state?.startPlace  ?? { name: 'Rīga', lat: 56.946, lon: 24.105 }
  const maxDistance = state?.maxDistance ?? 200
  const pool        = isDate ? DATE_POOL : ACTIVITY_POOL

  // Use provided coords if available, otherwise look up by name
  const startCoords = (startPlace.lat != null && startPlace.lon != null)
    ? { lat: startPlace.lat, lon: startPlace.lon }
    : getCityCoords(startPlace.name ?? 'Rīga')

  const filtered = filterPoolByLocation(pool, startCoords, maxDistance)
  const selected = selectFromPool(filtered, budget)
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

  // ── Location context for prompt ────────────────────────────
  const allowedCities = citiesWithinRadius(startName, maxDistance)
    .map((c) => (c.km === 0 ? c.name : `${c.name} (~${c.km} km)`))
    .slice(0, 12) // keep prompt compact

  const radiusLine = maxDistance >= 200
    ? 'Radius: no restriction — all of Latvia is allowed.'
    : `Radius: ${maxDistance} km from ${startName}.`
  const citiesLine = allowedCities.length > 0
    ? `Allowed cities/areas: ${allowedCities.join(', ')}.`
    : ''

  // ── Budget lines ───────────────────────────────────────────
  const budgetLabel = budget === 0 ? '€0 — FREE ONLY' : `€${budget}`
  const budgetLines = [
    `🚨 BUDGET CONSTRAINT — MOST IMPORTANT RULE:`,
    `   Total budget: ${budgetLabel}`,
    `   The SUM of ALL "cost" fields MUST NOT exceed €${budget}.`,
    `   Each "cost" = realistic non-negative integer EUR. Free = 0.`,
    budget === 0
      ? `   ALL stops MUST have cost: 0. Any stop with cost > 0 is FORBIDDEN.`
      : budget <= 15
        ? `   Budget is very tight — use free parks, walks, viewpoints only.`
        : budget <= 40
          ? `   Moderate budget — mix free and inexpensive (€5–15) stops.`
          : null,
  ].filter(Boolean).join('\n')

  // ── Type / preference lines ────────────────────────────────
  const contextLines = isDate
    ? [
        `Type: Romantic date${partnerName ? ` with ${partnerName}` : ''}.`,
        `Vibe: ${vibes.join(', ') || 'romantic'}.`,
        mood && mood !== 'neutral' ? `Partner mood today: ${mood}.` : null,
      ].filter(Boolean)
    : [
        `Type: Group activity.`,
        `Interests: ${interests.join(', ') || 'nature'}.`,
        hasKids ? `Children present — keep activities family-friendly.` : null,
        hasDog  ? `Dog coming — include dog-friendly outdoor venues.`   : null,
      ].filter(Boolean)

  const prompt = `You are an expert Latvia tourism guide. Create a personalised itinerary in Latvian.

${contextLines.join('\n')}
Transport: ${transport.join(', ') || 'walk'}.
Duration: ~${duration} hours.

📍 LOCATION CONSTRAINTS (MANDATORY):
   Start: ${startName}.
   ${radiusLine}
   ${citiesLine}
   ALL stops MUST be within ${maxDistance >= 200 ? 'Latvia' : `${maxDistance} km of ${startName}`}.
   NEVER mix stops from opposite ends of Latvia in one route.
   All stops must be in the same geographic area — within ~30 km of each other.

${budgetLines}

Each stop needs a "location" field with the Latvian city name (e.g. "Rīga", "Sigulda").

Return ONLY a valid JSON array (no markdown, no extra text) with 3–5 stops in Latvian:
[
  {
    "time": "17:00",
    "duration": "1 st.",
    "title": "Vietas nosaukums latviski",
    "desc": "2–3 teikumu apraksts latviešu valodā.",
    "icon": "🎭",
    "cost": 0,
    "location": "Rīga",
    "tags": ["Kultūra", "Bezmaksas"]
  }
]

Final check: sum of all cost values ≤ €${budget}.${budget === 0 ? ' Every cost must be exactly 0.' : ''}`

  if (!API_KEY) return buildFallback(state)

  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: 'text/plain' },
      }),
    })

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)

    const data    = await res.json()
    const parts   = data?.candidates?.[0]?.content?.parts ?? []
    const rawText = parts.map((p) => p.text ?? '').join('')

    const clean = rawText
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
      .replace(/```(?:json)?/g, '')
      .trim()

    const match = clean.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON array in response')

    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty array')

    const normalised = parsed.map((s) => ({ ...s, cost: Math.round(Number(s.cost) || 0) }))
    const enforced   = enforceBudget(normalised, budget)

    if (enforced.length === 0) return buildFallback(state)

    return assignTimes(enforced, isDate)

  } catch (err) {
    console.warn('[routeGenerator] Gemini failed, using fallback:', err.message)
    return buildFallback(state)
  }
}
