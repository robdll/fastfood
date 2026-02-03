import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  createT,
  getInitialLang,
  normalizeLang,
  setStoredLang,
} from './i18n'
import AppRoutes from './routes/AppRoutes'
import { clearJwt, getJwt, setJwt } from './utils/auth'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)
  const [jwt, setJwtState] = useState(getJwt)
  const isAuthed = Boolean(jwt)
  const [lang, setLang] = useState(getInitialLang)
  const t = useMemo(() => createT(lang), [lang])
  const handleLangChange = (next) => setLang(normalizeLang(next))

  useEffect(() => {
    setStoredLang(lang)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setError(null)
        const res = await fetch('/api/health')
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = await res.json()
        if (!cancelled) setHealth(data)
      } catch (e) {
        if (!cancelled) setError(e?.message ?? String(e))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AppRoutes
      health={health}
      error={error}
      isAuthed={isAuthed}
      lang={lang}
      onLangChange={handleLangChange}
      onLogin={() => {
        const token = `demo-token-${Date.now()}`
        setJwt(token)
        setJwtState(token)
      }}
      onLogout={() => {
        clearJwt()
        setJwtState(null)
      }}
      t={t}
    />
  )
}

export default App
