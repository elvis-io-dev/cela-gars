export default function SliderInput({ label, value, onChange, min, max, step = 1, format }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-sm font-semibold text-primary">
          {format ? format(value) : value}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-amber-400 transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-black/40 border-2 border-primary transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  )
}
