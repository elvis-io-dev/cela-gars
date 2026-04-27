import { useState, useEffect } from 'react'
import { fetchPlacePhoto } from '../services/googlePlaces'
import { MapPin } from 'lucide-react'

/**
 * Fetches and displays a Google Places photo for a given place name.
 * Shows a shimmer skeleton while loading; falls back to a tinted placeholder.
 */
export default function LocationPhoto({ placeName, className = '', style = {} }) {
  const [url, setUrl]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    fetchPlacePhoto(placeName)
      .then((photoUrl) => {
        if (cancelled) return
        if (photoUrl) setUrl(photoUrl)
        else setError(true)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [placeName])

  if (loading) {
    return (
      <div
        className={`skeleton ${className}`}
        style={{ background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', ...style }}
      />
    )
  }

  if (error || !url) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-orange-50 ${className}`}
        style={style}
      >
        <MapPin size={20} className="text-orange-300" />
        <span className="text-[10px] text-orange-300 text-center px-2 truncate max-w-full">
          {placeName}
        </span>
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={placeName}
      className={`object-cover ${className}`}
      style={style}
      loading="lazy"
    />
  )
}
