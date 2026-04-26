export default function TagSelector({ options, selected, onToggle, multi = true }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = multi
          ? selected.includes(opt.value ?? opt)
          : selected === (opt.value ?? opt)
        const label = opt.label ?? opt
        const value = opt.value ?? opt

        return (
          <button
            key={value}
            onClick={() => onToggle(value)}
            className={isSelected ? 'tag-active' : 'tag'}
          >
            {opt.icon && <span className="mr-1">{opt.icon}</span>}
            {label}
          </button>
        )
      })}
    </div>
  )
}
