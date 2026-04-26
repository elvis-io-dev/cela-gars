import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, backTo = '/', action }) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center gap-3 px-5 pt-14 pb-4">
      <button
        onClick={() => navigate(backTo)}
        className="glass w-10 h-10 flex items-center justify-center rounded-xl active:scale-90 transition-transform shrink-0"
        aria-label="Atpakaļ"
      >
        <ArrowLeft size={18} className="text-white/80" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-xl text-white truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>
        )}
      </div>

      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </header>
  )
}
