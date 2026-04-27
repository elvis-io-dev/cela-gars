/**
 * Seasonal intelligence for Latvia.
 * Months are 0-indexed (Jan=0, Dec=11).
 */

export function getSeason() {
  const m = new Date().getMonth()
  if ([11, 0, 1].includes(m)) return 'winter'
  if ([2, 3, 4].includes(m))  return 'spring'
  if ([5, 6, 7].includes(m))  return 'summer'
  return 'autumn'
}

export function getSeasonLabel() {
  return { winter: '❄️ Ziema', spring: '🌸 Pavasaris', summer: '☀️ Vasara', autumn: '🍂 Rudens' }[getSeason()]
}

/**
 * Seasonal bonus stop suggestions added to the timeline.
 */
const SEASONAL_STOPS = {
  winter: [
    { time: '+', duration: '2 st.', icon: '⛸️', title: 'Mežaparka Slidotava', cost: 8,
      desc: 'Rīgas lielākā ārtelpu slidotava ar muzikālu pavadījumu un nakts slēpošanu.' ,
      tags: ['Ziema', 'Aktīvs'] },
    { time: '+', duration: '1 st.', icon: '🎄', title: 'Ziemassvētku Tirgus — Doma laukums', cost: 0,
      desc: 'Tradicionālie tirdziņi ar karsto vīnu, pīrāgiem un latvju amatiem.',
      tags: ['Ziema', 'Bezmaksas'] },
    { time: '+', duration: '1.5 st.', icon: '🛷', title: 'Kamaniņu trase Siguldā', cost: 12,
      desc: 'Modernā kamaniņu trase cauri Gaujas nacionālajam parkam.',
      tags: ['Ziema', 'Adrenalīns'] },
  ],
  spring: [
    { time: '+', duration: '1.5 st.', icon: '🌸', title: 'Nacionālais Botāniskais dārzs', cost: 3,
      desc: 'Pavasara ziedēšana — ķiršu koki, tulpes un magnolijas Salaspilī.',
      tags: ['Pavasaris', 'Daba'] },
    { time: '+', duration: '2 st.', icon: '🏡', title: 'Latvijas Brīvdabas muzejs', cost: 5,
      desc: 'Latvijas lauku arhitektūra pavasara zaļumā — 118 vēsturiskas ēkas.',
      tags: ['Pavasaris', 'Kultūra'] },
  ],
  summer: [
    { time: '+', duration: '3 st.', icon: '🏖️', title: 'Jūrmala — Majori pludmale', cost: 0,
      desc: 'Latvijas populārākā pludmale — balts smilts, Baltijas jūra un Majori kūrorts.',
      tags: ['Vasara', 'Pludmale'] },
    { time: '+', duration: '2 st.', icon: '🚲', title: 'Velo maršruts pa Rīgas dambja joslu', cost: 5,
      desc: 'Noma un brauciens pa Daugavas krastu — pilsētas panorāma no divriteni.',
      tags: ['Vasara', 'Sports'] },
    { time: '+', duration: '2 st.', icon: '🏊', title: 'Kaniera ezers — Ķemeri', cost: 0,
      desc: 'Ķemeru nacionālais parks ar siltu ezeru un meža taciņām.',
      tags: ['Vasara', 'Daba'] },
  ],
  autumn: [
    { time: '+', duration: '3 st.', icon: '🍄', title: 'Sēņošana Babītes mežā', cost: 0,
      desc: 'Latvijas tradīcija — rudens sēņošana un ogu lasīšana. Gids pēc pieprasījuma.',
      tags: ['Rudens', 'Daba', 'Bezmaksas'] },
    { time: '+', duration: '2 st.', icon: '🍂', title: 'Gauja rudens krāsās — Sigulda', cost: 0,
      desc: 'Gaujas ieleja zeltenā un sarkanā — vislabākais laiks apmeklēt nacionālo parku.',
      tags: ['Rudens', 'Daba'] },
  ],
}

/**
 * Returns 2 seasonal stop suggestions filtered by weather.
 * Removes outdoor stops if rainy.
 */
export function getSeasonalStops(weather) {
  const season  = getSeason()
  const stops   = SEASONAL_STOPS[season] ?? []
  const isRainy = weather?.condition === 'rainy'

  return stops
    .filter((s) => {
      if (!isRainy) return true
      // Keep indoor-friendly stops in rain
      const outdoorKeywords = ['pludmale', 'velo', 'sēņošan', 'ezers', 'kamaniņ']
      const titleLow = s.title.toLowerCase()
      return !outdoorKeywords.some((k) => titleLow.includes(k))
    })
    .slice(0, 2)
}

/**
 * Returns a human-readable warning if the activity is seasonally inappropriate.
 * e.g. { show: true, message: "Pludmale nav piemērota ziemā" }
 */
export function getSeasonalWarning(vibes = [], interests = [], weather) {
  const season  = getSeason()
  const isRainy = weather?.condition === 'rainy'
  const warnings = []

  if (season === 'winter' && (vibes.includes('outdoor') || interests.includes('beach')))
    warnings.push('🏖️ Pludmale un ārtelpu baudīšana nav ideāla ziemā Latvijā.')

  if (isRainy && (interests.includes('beach') || vibes.includes('outdoor')))
    warnings.push('☔ Lietus gadījumā ārtelpu aktivitātes var būt neērtākas.')

  if (season === 'winter' && interests.includes('beach'))
    warnings.push('❄️ Jūrmala ziemā ir romantiski, bet auksts — ņem siltu apģērbu!')

  return warnings
}
