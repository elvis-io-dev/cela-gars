/**
 * Geography utilities for Latvia.
 *
 * Covers: distance (haversine), compass bearing, city lookup (with
 * diacritic-tolerant fuzzy matching), travel-time estimation, and
 * a helper that returns which cities fall within a given radius /
 * direction — used by the AI prompt to constrain destination choice.
 */

/* ── City dataset ────────────────────────────────────────────── */
export const CITY_DATA = [
  { name: 'Rīga',        lat: 56.946, lon: 24.105 },
  { name: 'Jūrmala',     lat: 56.968, lon: 23.771 },
  { name: 'Sigulda',     lat: 57.153, lon: 24.853 },
  { name: 'Cēsis',       lat: 57.312, lon: 25.276 },
  { name: 'Valmiera',    lat: 57.538, lon: 25.427 },
  { name: 'Liepāja',     lat: 56.505, lon: 21.011 },
  { name: 'Ventspils',   lat: 57.394, lon: 21.560 },
  { name: 'Daugavpils',  lat: 55.879, lon: 26.536 },
  { name: 'Jelgava',     lat: 56.653, lon: 23.712 },
  { name: 'Jēkabpils',   lat: 56.501, lon: 25.877 },
  { name: 'Ogre',        lat: 56.813, lon: 24.601 },
  { name: 'Tukums',      lat: 56.968, lon: 23.153 },
  { name: 'Dobele',      lat: 56.626, lon: 23.274 },
  { name: 'Kuldīga',     lat: 56.969, lon: 21.961 },
  { name: 'Saulkrasti',  lat: 57.257, lon: 24.412 },
  { name: 'Bauska',      lat: 56.409, lon: 24.192 },
  { name: 'Rēzekne',     lat: 56.509, lon: 27.331 },
  { name: 'Ķemeri',      lat: 56.925, lon: 23.490 },
  { name: 'Talsi',       lat: 57.245, lon: 22.583 },
  { name: 'Limbāži',     lat: 57.514, lon: 24.714 },
  { name: 'Smiltene',    lat: 57.423, lon: 25.906 },
  { name: 'Alūksne',     lat: 57.423, lon: 27.043 },
  { name: 'Saldus',      lat: 56.664, lon: 22.490 },
  { name: 'Tērvete',     lat: 56.558, lon: 23.373 },
  { name: 'Kandava',     lat: 57.033, lon: 22.779 },
  { name: 'Salacgrīva',  lat: 57.752, lon: 24.354 },
]

/* ── Math helpers ────────────────────────────────────────────── */
const toRad = (deg) => (deg * Math.PI) / 180

/** Haversine distance in km between two lat/lon points. */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Compass bearing (0–360°, clockwise from North) from A → B. */
export function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/** Convert bearing to one of: 'N' | 'E' | 'S' | 'W'. */
export function cardinalFromBearing(bearing) {
  if (bearing >= 315 || bearing < 45) return 'N'
  if (bearing < 135) return 'E'
  if (bearing < 225) return 'S'
  return 'W'
}

/* ── City lookup ─────────────────────────────────────────────── */

/** Strip Latvian (and general) diacritics for fuzzy comparison. */
function bare(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Fuzzy city name → { lat, lon }.
 * Tries: exact → starts-with → substring.
 * Falls back to Rīga if nothing matches.
 */
export function getCityCoords(name = '') {
  const n = bare(name.trim())
  if (!n) return { lat: 56.946, lon: 24.105 }

  let c =
    CITY_DATA.find((x) => bare(x.name) === n) ??
    CITY_DATA.find((x) => bare(x.name).startsWith(n) || n.startsWith(bare(x.name))) ??
    CITY_DATA.find((x) => bare(x.name).includes(n) || n.includes(bare(x.name)))

  return c ? { lat: c.lat, lon: c.lon } : { lat: 56.946, lon: 24.105 }
}

/**
 * Return cities within `maxKm` of `startName`, optionally filtered to a
 * cardinal direction.  Returns them sorted by distance.
 * Used to build the allowed-cities list in the AI prompt.
 */
export function citiesWithinRadius(startName, maxKm, direction = 'all') {
  const start = getCityCoords(startName)
  const results = []

  for (const city of CITY_DATA) {
    const dist = haversineKm(start.lat, start.lon, city.lat, city.lon)
    if (dist > maxKm) continue

    if (direction !== 'all' && dist > 8) {
      // 8 km tolerance so the origin city itself is always kept
      const bearing  = getBearing(start.lat, start.lon, city.lat, city.lon)
      const cardinal = cardinalFromBearing(bearing)
      if (cardinal !== direction) continue
    }
    results.push({ name: city.name, km: Math.round(dist) })
  }

  return results.sort((a, b) => a.km - b.km)
}

/* ── Travel time ─────────────────────────────────────────────── */

/** Realistic average speeds in km/h for each transport mode. */
export const TRANSPORT_SPEEDS = { car: 80, public: 40, bike: 15, walk: 5 }

/**
 * Maximum sensible travel distance for a given set of transport modes.
 * Used to cap the user's maxDistance slider — there's no point walking 50 km.
 *   walk   → 3 km   (city neighbourhood)
 *   bike   → 15 km  (urban area)
 *   public → 60 km  (regional bus/train)
 *   car    → 200 km (all Latvia)
 */
export function getTransportEffectiveRadius(transport = []) {
  if (transport.includes('car'))    return 200
  if (transport.includes('public')) return 60
  if (transport.includes('bike'))   return 15
  return 3
}

/**
 * Pick the fastest available mode from a transport array.
 * Falls back to walking if the array is empty or unrecognised.
 */
function fastestSpeed(transport = []) {
  for (const mode of ['car', 'public', 'bike', 'walk']) {
    if (transport.includes(mode)) return TRANSPORT_SPEEDS[mode]
  }
  return TRANSPORT_SPEEDS.walk
}

/** Human-readable travel time string, e.g. "~25 min" or "~1 st. 10 min". */
export function estimateTravelTime(distanceKm, transport = []) {
  const mins = Math.round((distanceKm / fastestSpeed(transport)) * 60)
  if (mins < 3)  return 'Uz vietas'
  if (mins < 60) return `~${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `~${h} st. ${m} min` : `~${h} st.`
}

/** Short label for the transport icon shown next to travel time. */
export function getTransportLabel(transport = []) {
  if (transport.includes('car'))    return 'ar auto'
  if (transport.includes('public')) return 'sabiedriskais'
  if (transport.includes('bike'))   return 'ar velosipēdu'
  return 'kājām'
}

/** Emoji icon for the dominant transport mode. */
export function getTransportIcon(transport = []) {
  if (transport.includes('car'))    return '🚗'
  if (transport.includes('public')) return '🚌'
  if (transport.includes('bike'))   return '🚲'
  return '🚶'
}
