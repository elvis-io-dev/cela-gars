/**
 * OpenWeatherMap API — current weather for Riga, Latvia.
 * Free tier endpoint: api.openweathermap.org/data/2.5/weather
 * Riga coordinates: lat=56.9496, lon=24.1052
 */

const API_KEY  = import.meta.env.VITE_OPENWEATHER_API_KEY
const RIGA_LAT = 56.9496
const RIGA_LON = 24.1052

/** Maps OWM weather condition codes to local type labels */
function classifyCondition(main) {
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) return 'rainy'
  if (main === 'Clear') return 'sunny'
  if (['Snow'].includes(main)) return 'snow'
  return 'cloudy'
}

/**
 * Fetch current Riga weather.
 * Returns null when the API key is absent; fallback data when the request fails.
 * @returns {Promise<object|null>}
 */
export async function fetchRigaWeather() {
  if (!API_KEY) {
    console.info('[Weather] No VITE_OPENWEATHER_API_KEY — using fallback')
    return null
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${RIGA_LAT}&lon=${RIGA_LON}` +
      `&appid=${API_KEY}&units=metric&lang=lv`
    )

    if (!res.ok) throw new Error(`OpenWeather HTTP ${res.status}`)
    const d = await res.json()

    return {
      temp:        Math.round(d.main.temp),
      feelsLike:   Math.round(d.main.feels_like),
      description: d.weather[0].description,   // already in Latvian (lang=lv)
      icon:        `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`,
      humidity:    d.main.humidity,             // %
      windSpeed:   Math.round(d.wind.speed * 3.6), // m/s → km/h
      condition:   classifyCondition(d.weather[0].main),
      city:        d.name,                      // "Riga"
    }
  } catch (err) {
    console.warn('[Weather] fetchRigaWeather failed:', err.message)
    return null
  }
}
