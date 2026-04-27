export default function GlassCard({ children, className = '', orange = false, onClick }) {
  const base = orange ? 'glass-orange' : 'glass'
  return (
    <div
      className={`${base} p-4 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
