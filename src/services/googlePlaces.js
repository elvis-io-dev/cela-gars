/**
 * Google Places API (New) — browser-compatible with CORS support.
 * Uses X-Goog-Api-Key header so the key is not in the URL query string.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
const BASE_URL = 'https://places.googleapis.com/v1'

/**
 * Search for a place in Latvia and return the first photo URL.
 * @param {string} placeName - e.g. "Rīgas Centrāltirgus"
 * @param {number} maxWidth  - photo width in px (default 600)
 * @returns {Promise<string|null>}
 */
export async function fetchPlacePhoto(placeName, maxWidth = 600) {
  if (!API_KEY) return null

  try {
    const res = await fetch(`${BASE_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.photos,places.displayName,places.rating',
      },
      body: JSON.stringify({
        textQuery: `${placeName} Latvia`,
        maxResultCount: 1,
        languageCode: 'lv',
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    const photoName = data?.places?.[0]?.photos?.[0]?.name
    if (!photoName) return null

    // Return the direct media URL — this is CORS-safe as an <img> src
    return `${BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`
  } catch (err) {
    console.warn('[GooglePlaces] fetchPlacePhoto failed:', err.message)
    return null
  }
}

/**
 * Batch-fetch photos for multiple place names.
 * Returns a map of { placeName: photoUrl | null }.
 */
export async function fetchPlacePhotos(placeNames) {
  const entries = await Promise.all(
    placeNames.map(async (name) => [name, await fetchPlacePhoto(name)])
  )
  return Object.fromEntries(entries)
}
