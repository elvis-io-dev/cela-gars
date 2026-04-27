import { MapPin, Clock, Tag, Euro } from 'lucide-react'

const CATEGORY_COLORS = {
  festivāls: 'bg-orange-100 text-orange-600',
  koncerts:  'bg-purple-100 text-purple-600',
  tirgus:    'bg-green-100  text-green-600',
  izstāde:   'bg-blue-100   text-blue-600',
  sports:    'bg-red-100    text-red-600',
  daba:      'bg-teal-100   text-teal-600',
}

/**
 * Renders a single Latvia event card (used in Home + RouteResult).
 */
export default function EventCard({ event, compact = false }) {
  const colorClass = CATEGORY_COLORS[event.category] ?? 'bg-gray-100 text-gray-600'

  if (compact) {
    return (
      <div className="glass p-3 flex items-start gap-3 min-w-[220px] max-w-[260px] shrink-0">
        <span className="text-2xl shrink-0 mt-0.5">{event.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-semibold text-sm leading-tight truncate">{event.title}</p>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{event.location}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${colorClass}`}>
              {event.category}
            </span>
            <span className="text-[10px] text-gray-400">{event.price}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass p-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-xl shrink-0">
          {event.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-gray-900 font-semibold text-sm leading-snug">{event.title}</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${colorClass}`}>
              {event.category}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} /> {event.date}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={11} /> {event.location}
            </span>
          </div>

          <p className="text-gray-600 text-xs leading-relaxed mt-2">{event.description}</p>

          <div className="flex items-center gap-1.5 mt-2">
            <Euro size={11} className="text-orange-500" />
            <span className="text-xs font-semibold text-orange-600">{event.price}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
