export default function SliderInput({ label, value, onChange, min, max, step = 1, format }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-bold text-orange-500">
          {format ? format(value) : value}
        </span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #F97316, #FBBF24)',
          }}
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
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-orange-500 shadow-md shadow-orange-200/60 transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
    </div>
  )
}
