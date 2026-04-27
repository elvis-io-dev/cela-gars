export default function Toggle({ options, value, onChange }) {
  return (
    <div
      className="flex p-1 rounded-2xl gap-1"
      style={{
        background: 'rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200
            ${value === opt.value
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
