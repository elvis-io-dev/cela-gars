/**
 * SideDrawer — global navigation drawer triggered by the hamburger button.
 * Slides in from the left. Rendered once in App.jsx; controlled via AppContext.
 */
import { useLocation, useNavigate } from 'react-router-dom'
import { X, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

const NAV_SECTIONS = [
  {
    label: 'Plānot',
    items: [
      {
        icon: '🗺️', label: 'Sākumlapa',    path: '/',
        desc: 'Notikumi un ātrā pārvietošanās',
      },
      {
        icon: '❤️', label: 'Randiņš',       path: '/date-planner',
        desc: 'Romantisks vakars diviem',
      },
      {
        icon: '🎒', label: 'Aktivitātes',   path: '/activity-planner',
        desc: 'Draugi, ģimene vai solo',
      },
    ],
  },
  {
    label: 'Atklāt',
    items: [
      {
        icon: '🤝', label: 'Ceļabiedris',   path: '/celabiedris',
        desc: 'Atrodi ceļojuma biedru',      badge: 'Jauns',
      },
      {
        icon: '📍', label: 'Mana karte',    path: '/mana-karte',
        desc: 'Apmeklētās un iecienītas vietas', badge: 'Jauns',
      },
    ],
  },
  {
    label: 'Cits',
    items: [
      {
        icon: '💡', label: 'Randiņu idejas', path: '/submit-idea',
        desc: 'Iesūti ideju, laimē balvas',
      },
      {
        icon: '👤', label: 'Partnera profils', path: '/partner-profile',
        desc: 'Saglabā preferences un gaumi',
      },
    ],
  },
]

export default function SideDrawer() {
  const { drawerOpen, closeDrawer, guestMode, toggleGuestMode } = useApp()
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  const go = (path) => {
    navigate(path)
    closeDrawer()
  }

  return (
    /* Always mounted — visibility controlled via CSS transforms */
    <div
      className="fixed inset-0 z-[200]"
      style={{ pointerEvents: drawerOpen ? 'auto' : 'none' }}
    >
      {/* ── Backdrop ── */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
          opacity: drawerOpen ? 1 : 0,
        }}
      />

      {/* ── Panel ── */}
      <div
        className="absolute left-0 top-0 bottom-0 flex flex-col"
        style={{
          width: '78vw',
          maxWidth: 300,
          background: 'linear-gradient(160deg, #FFF7ED 0%, #FFFFFF 40%, #F5F3FF 100%)',
          borderRight: '1px solid rgba(249,115,22,0.12)',
          boxShadow: '8px 0 40px rgba(0,0,0,0.18)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <h2 className="font-extrabold text-xl tracking-tight">
              <span className="text-gradient">Ceļa Gars</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Tava Latvijas piedzīvojumu karte</p>
          </div>
          <button
            onClick={closeDrawer}
            className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
            style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}
            aria-label="Aizvērt"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
                {section.label}
              </p>
              {section.items.map((item) => {
                const isActive = pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all active:scale-[0.98]"
                    style={isActive ? {
                      background: 'rgba(249,115,22,0.10)',
                      border: '1px solid rgba(249,115,22,0.22)',
                    } : {
                      background: 'transparent',
                      border: '1px solid transparent',
                    }}
                  >
                    <span className="text-xl shrink-0 w-8 text-center">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-orange-600' : 'text-gray-800'}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{item.desc}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer — guest mode toggle */}
        <div className="px-4 pb-8 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => { toggleGuestMode(); closeDrawer() }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98]"
            style={{
              background: guestMode ? 'rgba(249,115,22,0.10)' : 'rgba(0,0,0,0.04)',
              border: guestMode ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {guestMode
              ? <Eye size={16} className="text-orange-500 shrink-0" />
              : <EyeOff size={16} className="text-gray-400 shrink-0" />
            }
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${guestMode ? 'text-orange-600' : 'text-gray-600'}`}>
                {guestMode ? '"Rādīt viņai" aktīvs' : 'Viešu režīms'}
              </p>
              <p className="text-[11px] text-gray-400">
                {guestMode ? 'Nospiedi lai izslēgtu' : 'Paslēpj plānošanas detaļas'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
