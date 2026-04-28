/**
 * Google Places API (New) autocomplete input.
 *
 * Props:
 *   value    { name: string, lat: number|null, lon: number|null }
 *   onChange ({ name, lat, lon }) => void
 *
 * Behaviour:
 *  • Debounces input 300ms → autocomplete restricted to 'lv' (Latvia)
 *  • Selecting a suggestion fetches the place's lat/lon and calls onChange
 *  • Blurring without selecting calls onChange with the typed name + null coords
 *    (routeGenerator falls back to getCityCoords for fuzzy matching)
 *  • With no API key: works as a plain text input (same fallback applies)
 *  • Keyboard: ↑/↓ to navigate, Enter to select, Escape to close
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

const API_KEY  = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
const BASE_URL = 'https://places.googleapis.com/v1'

/* ── API helpers ─────────────────────────────────────────────── */

async function fetchSuggestions(input) {
  if (!API_KEY || input.length < 2) return []
  try {
    const res = await fetch(`${BASE_URL}/places:autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: ['lv'],
        languageCode: 'lv',
      }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.suggestions ?? []
  } catch {
    return []
  }
}

async function fetchPlaceCoords(placeId) {
  if (!API_KEY) return null
  try {
    const res = await fetch(`${BASE_URL}/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'location',
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.location
      ? { lat: data.location.latitude, lon: data.location.longitude }
      : null
  } catch {
    return null
  }
}

/* ── Component ───────────────────────────────────────────────── */

export default function PlacesAutocomplete({ value, onChange }) {
  const [inputText,    setInputText]    = useState(value?.name ?? 'Rīga')
  const [suggestions,  setSuggestions]  = useState([])
  const [open,         setOpen]         = useState(false)
  const [searching,    setSearching]    = useState(false)  // typing spinner
  const [resolving,    setResolving]    = useState(false)  // coords fetch spinner
  const [activeIdx,    setActiveIdx]    = useState(-1)
  const debounceTimer  = useRef(null)
  const containerRef   = useRef(null)
  const justSelected   = useRef(false)  // prevents blur from overwriting a selection

  // Sync display when parent resets the value externally
  useEffect(() => {
    if (value?.name && value.name !== inputText && !open) {
      setInputText(value.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.name])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setSuggestions([])
    setActiveIdx(-1)
  }, [])

  /* ── Input change ─────────────────────────────────────────── */
  const handleChange = (e) => {
    const val = e.target.value
    setInputText(val)
    setActiveIdx(-1)
    clearTimeout(debounceTimer.current)

    if (val.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    setSearching(true)
    debounceTimer.current = setTimeout(async () => {
      const suggs = await fetchSuggestions(val)
      setSuggestions(suggs)
      setOpen(suggs.length > 0)
      setSearching(false)
    }, 300)
  }

  /* ── Blur (typed but didn't pick a suggestion) ───────────── */
  const handleBlur = () => {
    // Give click handlers on suggestions time to fire first
    setTimeout(() => {
      if (justSelected.current) { justSelected.current = false; return }
      close()
      // Update parent with just the typed name (no coords → fallback to getCityCoords)
      if (inputText.trim() && inputText.trim() !== value?.name) {
        onChange({ name: inputText.trim(), lat: null, lon: null })
      }
    }, 180)
  }

  /* ── Suggestion selected ─────────────────────────────────── */
  const handleSelect = async (suggestion) => {
    justSelected.current = true
    const pred   = suggestion.placePrediction
    const name   = pred.structuredFormat?.mainText?.text ?? pred.text?.text ?? inputText
    const placeId = pred.placeId

    setInputText(name)
    close()

    setResolving(true)
    const coords = await fetchPlaceCoords(placeId)
    setResolving(false)

    onChange({ name, lat: coords?.lat ?? null, lon: coords?.lon ?? null })
  }

  /* ── Keyboard navigation ─────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]) }
        break
      case 'Escape':
        close()
        break
      default: break
    }
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="relative">

      {/* Input row */}
      <div className="flex items-center gap-3">
        {resolving
          ? <Loader2 size={16} className="text-orange-500 shrink-0 animate-spin" />
          : <MapPin   size={16} className="text-orange-500 shrink-0" />
        }
        <input
          type="text"
          value={inputText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          onBlur={handleBlur}
          placeholder="Rīga"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-sm font-medium outline-none"
        />
        {searching && (
          <Loader2 size={13} className="text-gray-300 shrink-0 animate-spin" />
        )}
      </div>

      {/* Suggestion dropdown */}
      {open && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 z-50 mt-2 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.97)',
            border: '1px solid rgba(249,115,22,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {suggestions.slice(0, 5).map((s, i) => {
            const pred      = s.placePrediction
            const main      = pred.structuredFormat?.mainText?.text ?? pred.text?.text ?? ''
            const secondary = pred.structuredFormat?.secondaryText?.text ?? ''
            const isActive  = i === activeIdx

            return (
              <button
                key={pred.placeId}
                onMouseDown={(e) => e.preventDefault()} // keep focus on input
                onClick={() => handleSelect(s)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                  ${isActive ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <MapPin size={13} className="text-gray-300 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                    {main}
                  </p>
                  {secondary && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{secondary}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
