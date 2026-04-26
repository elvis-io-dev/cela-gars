import { useNavigate } from 'react-router-dom'
import { Heart, Users, Compass, Star, MapPin } from 'lucide-react'

const floatingOrbs = [
  { size: 180, top: '-40px', right: '-50px', opacity: 0.18 },
  { size: 120, top: '220px', left: '-40px', opacity: 0.10 },
  { size: 80,  bottom: '160px', right: '20px', opacity: 0.12 },
]

export default function Home() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Labrīt' : hour < 18 ? 'Labdien' : 'Labvakar'

  return (
    <div className="relative flex flex-col min-h-dvh overflow-hidden">
      {/* Background orbs */}
      {floatingOrbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            background: 'radial-gradient(circle, #F97316, transparent 70%)',
            opacity: orb.opacity,
            filter: 'blur(20px)',
          }}
        />
      ))}

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <div>
          <p className="text-white/40 text-sm">{greeting}!</p>
          <h1 className="text-white font-bold text-2xl mt-0.5">
            <span className="text-gradient">Ceļa Gars</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/partner-profile')}
          className="glass w-11 h-11 flex items-center justify-center rounded-2xl active:scale-90 transition-transform"
          aria-label="Partnera profils"
        >
          <span className="text-lg">👤</span>
        </button>
      </div>

      {/* Tagline */}
      <div className="px-5 mt-2 mb-8">
        <p className="text-white/50 text-sm leading-relaxed">
          Atklāj Latviju — plāno svētku dienas,&nbsp;
          piedzīvojumus un braucienus.
        </p>
      </div>

      {/* Main action cards */}
      <div className="px-5 flex flex-col gap-4 flex-1">
        {/* Date Planner card */}
        <button
          onClick={() => navigate('/date-planner')}
          className="group relative overflow-hidden rounded-3xl p-6 text-left active:scale-[0.98] transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.25) 0%, rgba(249,115,22,0.08) 100%)',
            border: '1px solid rgba(249,115,22,0.3)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 group-active:opacity-30 transition-opacity"
            style={{ background: 'radial-gradient(circle, #F97316, transparent 70%)' }}
          />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Heart size={22} className="text-primary" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Randiņa plānotājs</h2>
              <p className="text-white/50 text-sm mt-1 leading-relaxed">
                Pirmais randiņš vai romantisks vakars — izveido perfektu maršrutu diviem.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            {['🕯️', '🌹', '🍷', '🎭', '🌅'].map((e, i) => (
              <span key={i} className="text-base">{e}</span>
            ))}
            <span className="ml-1 text-xs text-white/30">& vairāk</span>
          </div>
        </button>

        {/* Activity Planner card */}
        <button
          onClick={() => navigate('/activity-planner')}
          className="group relative overflow-hidden rounded-3xl p-6 text-left active:scale-[0.98] transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10 group-active:opacity-15 transition-opacity"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }}
          />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Users size={22} className="text-white/70" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Aktivitāšu plānotājs</h2>
              <p className="text-white/50 text-sm mt-1 leading-relaxed">
                Draugi, ģimene vai solo — atrod ko darīt Latvijā šodien.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            {['🏕️', '🚵', '🎨', '🏄', '🎪'].map((e, i) => (
              <span key={i} className="text-base">{e}</span>
            ))}
            <span className="ml-1 text-xs text-white/30">& vairāk</span>
          </div>
        </button>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-2 mb-8">
          {[
            { icon: <MapPin size={16} />, label: 'Vietas', value: '240+' },
            { icon: <Star size={16} />, label: 'Maršruti', value: '80+' },
            { icon: <Compass size={16} />, label: 'Novadi', value: '9' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-3 text-center">
              <div className="text-primary flex justify-center mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-base">{stat.value}</div>
              <div className="text-white/30 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
