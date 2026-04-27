/**
 * OpenAI API — gpt-4o-search-preview with built-in web search.
 * Falls back to curated static events if the API key is missing or the call fails.
 */

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const FALLBACK_EVENTS = [
  {
    title: 'Rīgas Svētki',
    date: 'Šajā nedēļas nogalē',
    location: 'Rīgas Vecpilsēta',
    description: 'Galvaspilsētas jubilejas svinības ar koncertiem, tirgiem un gaismas šovu.',
    price: 'Bezmaksas',
    category: 'festivāls',
    emoji: '🎉',
  },
  {
    title: 'Jūras svētki Jūrmalā',
    date: 'Sestdiena–svētdiena',
    location: 'Jūrmala, Majori',
    description: 'Tradicionālie jūras svētki ar regatām, mūziku un vietējo ēdienu tirdziņu.',
    price: '€0–5',
    category: 'festivāls',
    emoji: '⛵',
  },
  {
    title: 'Siguldas Opermūzikas Svētki',
    date: 'Sestdiena 19:00',
    location: 'Siguldas Jaunā pils',
    description: 'Āra operas uzvedums Gaujas nacionālā parka zaļajā apkaimē.',
    price: '€15–35',
    category: 'koncerts',
    emoji: '🎭',
  },
  {
    title: 'Zemnieku Sēta Tirgus',
    date: 'Sestdiena 8:00–14:00',
    location: 'Rīga, Esplanāde',
    description: 'Svaigi vietējie produkti, amatniecība un bioloģiskais ēdiens no Latvijas saimniekiem.',
    price: 'Bezmaksas (ieeja)',
    category: 'tirgus',
    emoji: '🥕',
  },
]

/**
 * Fetch real-time Latvia events using OpenAI web search.
 * @returns {Promise<Array>} Array of event objects
 */
export async function fetchLatviaEvents() {
  if (!API_KEY) return FALLBACK_EVENTS

  const today = new Date().toLocaleDateString('lv-LV', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const prompt = `Today is ${today}. Use web search to find 4 real upcoming events or activities \
happening in Latvia this weekend or next 7 days. Focus on Riga, Sigulda, Jurmala, Cesis, Liepaja. \
Return ONLY a valid JSON array (no markdown code fences, no extra text):
[
  {
    "title": "Event name in Latvian",
    "date": "Day and time",
    "location": "City or venue",
    "description": "1-2 sentence description in Latvian",
    "price": "Price or 'Bezmaksas'",
    "category": "festivāls|koncerts|tirgus|izstāde|sports|daba",
    "emoji": "single relevant emoji"
  }
]`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        web_search_options: { search_context_size: 'medium' },
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''

    // Strip any accidental markdown fences
    const clean = text.replace(/```(?:json)?/g, '').trim()
    const match = clean.match(/\[[\s\S]*\]/)
    if (!match) return FALLBACK_EVENTS

    const parsed = JSON.parse(match[0])
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK_EVENTS
  } catch (err) {
    console.warn('[OpenAI] fetchLatviaEvents failed:', err.message)
    return FALLBACK_EVENTS
  }
}
