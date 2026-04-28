/**
 * Global app state:
 *  - guestMode   : "Rādīt viņai" — hides planning details, shows clean plan
 *  - partnerProfile : persisted to localStorage so RescueMode can access it
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const PROFILE_KEY = 'celagars_partner'
const GUEST_KEY   = 'celagars_guest'

const DEFAULT_PROFILE = {
  name: '', age: '', avatar: '👩',
  interests: [], personality: [], dislikes: [], note: '',
}

function loadProfile() {
  try { return { ...DEFAULT_PROFILE, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') } }
  catch { return DEFAULT_PROFILE }
}

const AppContext = createContext({
  guestMode: false,
  toggleGuestMode: () => {},
  partnerProfile: DEFAULT_PROFILE,
  savePartnerProfile: () => {},
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
})

export function AppProvider({ children }) {
  const [guestMode, setGuestMode] = useState(
    () => localStorage.getItem(GUEST_KEY) === 'true'
  )
  const [partnerProfile, setPartnerProfile] = useState(loadProfile)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleGuestMode = useCallback(() => {
    setGuestMode((v) => {
      const next = !v
      localStorage.setItem(GUEST_KEY, next)
      return next
    })
  }, [])

  const savePartnerProfile = useCallback((profile) => {
    setPartnerProfile(profile)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }, [])

  const openDrawer  = useCallback(() => setDrawerOpen(true),  [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = 'hidden'
    else            document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <AppContext.Provider value={{
      guestMode, toggleGuestMode,
      partnerProfile, savePartnerProfile,
      drawerOpen, openDrawer, closeDrawer,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
