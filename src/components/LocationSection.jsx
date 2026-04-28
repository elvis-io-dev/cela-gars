/**
 * LocationSection — "Sākumpunkts" block used in DatePlanner and ActivityPlanner.
 *
 * Props:
 *   startPlace     { name: string, lat: number|null, lon: number|null }
 *   setStartPlace  fn({ name, lat, lon })
 *   maxDistance    number   (5–200 km)
 *   setMaxDistance fn(number)
 */
import PlacesAutocomplete from './PlacesAutocomplete'
import GlassCard from './GlassCard'
import SliderInput from './SliderInput'

export default function LocationSection({
  startPlace, setStartPlace,
  maxDistance, setMaxDistance,
}) {
  return (
    <section className="mb-6">
      <p className="section-label">Sākumpunkts</p>
      <GlassCard>
        {/* Google Places autocomplete input */}
        <PlacesAutocomplete value={startPlace} onChange={setStartPlace} />

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
    </section>
  )
}
