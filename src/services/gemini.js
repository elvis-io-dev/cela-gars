/**
 * Google Gemini API with Google Search grounding.
 * Fetches real-time Latvia weekend events via grounded generation.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-2.0-flash'
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const FALLBACK_EVENTS = [
  {
    title: 'Mežaparka Lielā Estrāde — Vasaras Koncerts',
    date: 'Sestdiena 20:00',
    location: 'Rīga, Mežaparks',
    description: 'Latvijas Nacionālā simfoniskā orķestra vasaras sezonas noslēguma koncerts brīvā dabā.',
    price: '€12–25',
    category: 'koncerts',
    emoji: '🎶',
  },
  {
    title: 'Āgenskalna Tirgus Svētdiena',
    date: 'Svētdiena 9:00–15:00',
    location: 'Rīga, Āgenskalns',
    description: 'Rīgas vecākais tirgus ar vietējiem zemniekiem, vintāžu un mājražošanas produktiem.',
    price: 'Bezmaksas',
    category: 'tirgus',
    emoji: '🛒',
  },
  {
    title: 'Gauja Kajakos',
    date: 'Sestdiena–svētdiena',
    location: 'Valmiera – Sigulda',
    description: 'Organizēts kajakošanas brauciens pa Gauju cauri nacionālajam parkam.',
    price: '€25–40',
    category: 'daba',
    emoji: '🛶',
  },
  {
    title: 'Rīgas Motormuzeums — Nakts Ekskursija',
    date: 'Sestdiena 21:00',
    location: 'Rīga, Sarkandaugava',
    description: 'Muzeja kolekcija nakts gaisotnē ar gida stāstiem par padomju laikmeta automašīnām.',
    price: '€8',
    category: 'izstāde',
    emoji: '🚗',
  },
]

/**
 * Fetch this weekend's Latvia events using Gemini + Google Search grounding.
 * @returns {Promise<Array>} Array of event objects
 */
export async function fetchWeekendEvents() {
  if (!API_KEY) return FALLBACK_EVENTS

  const today = new Date().toLocaleDateString('lv-LV', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const prompt = `Šodienas datums: ${today}.
Izmanto Google meklēšanu un atrod 4 reālus notikumus vai aktivitātes Latvijā šajā nedēļas nogalē.
Fokusējies uz Rīgu, Siguldu, Jūrmalu, Cēsīm, Liepāju.
Atgriez TIKAI derīgu JSON masīvu (bez markdown, bez papildu teksta):
[
  {
    "title": "Notikuma nosaukums",
    "date": "Diena un laiks",
    "location": "Pilsēta vai vieta",
    "description": "1-2 teikumu apraksts latviešu valodā",
    "price": "Cena vai 'Bezmaksas'",
    "category": "festivāls|koncerts|tirgus|izstāde|sports|daba",
    "emoji": "viens atbilstošs emocijzīme"
  }
]`

  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: { temperature: 0.2 },
      }),
    })

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)
    const data = await res.json()

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const clean = text.replace(/```(?:json)?/g, '').trim()
    const match = clean.match(/\[[\s\S]*\]/)
    if (!match) return FALLBACK_EVENTS

    const parsed = JSON.parse(match[0])
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK_EVENTS
  } catch (err) {
    console.warn('[Gemini] fetchWeekendEvents failed:', err.message)
    return FALLBACK_EVENTS
  }
}
