import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Menu } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function PageHeader({ title, subtitle, backTo = '/', action }) {
  const navigate = useNavigate()
  const { openDrawer } = useApp()

  return (
    <header
      className="flex items-center gap-3 px-5 pt-14 pb-4 relative z-10"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.70)',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate(backTo)}
        className="w-10 h-10 flex items-center justify-center rounded-xl active:scale-90 transition-transform shrink-0"
        style={{
          background: 'rgba(255,255,255,0.80)',
          border: '1px solid rgba(209,213,219,0.60)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        aria-label="Atpakaļ"
      >
        <ArrowLeft size={18} className="text-gray-600" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-xl text-gray-900 truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Optional action slot (e.g. Share button) */}
      {action && <div className="shrink-0">{action}</div>}

      {/* Hamburger — always present */}
      <button
        onClick={openDrawer}
        className="w-10 h-10 flex items-center justify-center rounded-xl active:scale-90 transition-transform shrink-0"
        style={{
          background: 'rgba(255,255,255,0.80)',
          border: '1px solid rgba(209,213,219,0.60)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        aria-label="Navigācijas izvēlne"
      >
        <Menu size={18} className="text-gray-600" />
      </button>
    </header>
  )
}
