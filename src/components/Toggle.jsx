export default function Toggle({ options, value, onChange }) {
  return (
    <div className="glass flex p-1 rounded-2xl gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200
            ${value === opt.value
              ? 'bg-primary text-white shadow-lg shadow-orange-500/30'
              : 'text-white/50 hover:text-white/70'
            }`}
        >
          {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
