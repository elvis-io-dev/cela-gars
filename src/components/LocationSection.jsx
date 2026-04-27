/**
 * LocationSection — reusable "Sākumpunkts" block used in both planners.
 *
 * Props:
 *   startLocation   string       current city/text value
 *   setStartLocation fn(string)
 *   maxDistance     number       0–200 km
 *   setMaxDistance  fn(number)
 *   direction       'all'|'N'|'E'|'S'|'W'
 *   setDirection    fn(string)
 */
import { MapPin } from 'lucide-react'
import GlassCard from './GlassCard'
import SliderInput from './SliderInput'

const QUICK_CITIES = ['Rīga', 'Jūrmala', 'Ogre', 'Jelgava', 'Sigulda', 'Cēsis']

// Compass rose layout — rendered as a 3×3 grid, corners empty.
//   [ ]  [N]  [ ]
//   [W] [All] [E]
//   [ ]  [S]  [ ]
const COMPASS = [
  null,
  { value: 'N', emoji: '↑', label: 'Ziemeļi' },
  null,
  { value: 'W', emoji: '←', label: 'Rietumi'  },
  { value: 'all', emoji: '✦', label: 'Visi'   },
  { value: 'E', emoji: '→', label: 'Austrumi' },
  null,
  { value: 'S', emoji: '↓', label: 'Dienvidi' },
  null,
]

function CompassBtn({ d, active, onClick }) {
  return (
    <button
      onClick={() => onClick(d.value)}
      className={`py-2.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all active:scale-90
        ${active ? 'glass-orange shadow-sm' : 'glass'}`}
    >
      <span className={`text-sm font-bold leading-none ${active ? 'text-orange-500' : 'text-gray-400'}`}>
        {d.emoji}
      </span>
      <span className={`text-[9px] font-semibold leading-tight text-center ${active ? 'text-orange-600' : 'text-gray-400'}`}>
        {d.label}
      </span>
    </button>
  )
}

export default function LocationSection({
  startLocation, setStartLocation,
  maxDistance,   setMaxDistance,
  direction,     setDirection,
}) {
  return (
    <section className="mb-6">
      <p className="section-label">Sākumpunkts</p>

      <GlassCard>
        {/* City input */}
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-orange-500 shrink-0" />
          <input
            type="text"
            placeholder="Rīga"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-sm font-medium outline-none"
          />
          {startLocation && startLocation !== 'Rīga' && (
            <button
              onClick={() => setStartLocation('Rīga')}
              className="text-[10px] text-gray-400 font-medium active:opacity-60"
            >
              reset
            </button>
          )}
        </div>

        {/* Quick city chips */}
        <div className="flex gap-2 overflow-x-auto mt-3 pb-0.5 -mx-0.5 px-0.5"
          style={{ scrollbarWidth: 'none' }}>
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setStartLocation(city)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all active:scale-95
                ${startLocation === city ? 'glass-orange text-orange-600' : 'glass text-gray-500'}`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Distance slider */}
        <div className="border-t mt-4 pt-4" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <SliderInput
            label="Cik tālu gatavs braukt"
            value={maxDistance}
            onChange={setMaxDistance}
            min={5}
            max={200}
            step={5}
            format={(v) => v >= 200 ? '🌍 Visa Latvija' : `${v} km`}
          />
        </div>
      </GlassCard>

      {/* Direction compass rose */}
      <div className="mt-3">
        <p className="text-xs text-gray-400 mb-2 font-medium pl-0.5">Virziens</p>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '216px' }}
        >
          {COMPASS.map((d, i) =>
            d === null
              ? <div key={i} />
              : <CompassBtn key={d.value} d={d} active={direction === d.value} onClick={setDirection} />
          )}
        </div>
      </div>
    </section>
  )
}
