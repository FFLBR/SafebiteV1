import { useState } from 'react'
import SafeBiteApp from '@/components/safebite-app'
import LandingPage from '@/components/landing-page'

const EXIT_MS = 500

export default function App() {
  const [landingVisible, setLandingVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  function handleStart() {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(() => setLandingVisible(false), EXIT_MS)
  }

  if (landingVisible) {
    return <LandingPage leaving={leaving} onStart={handleStart} />
  }

  return <SafeBiteApp />
}
