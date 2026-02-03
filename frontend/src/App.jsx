import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  createT,
  getInitialLang,
  normalizeLang,
  setStoredLang,
} from './i18n'
import AppRoutes from './routes/AppRoutes'
import { clearJwt, getJwt, setJwt } from './utils/auth'
import useToast from './hooks/useToast'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)
  const [jwt, setJwtState] = useState(getJwt)
  const isAuthed = Boolean(jwt)
  const [lang, setLang] = useState(getInitialLang)
  const t = useMemo(() => createT(lang), [lang])
  const { showToast } = useToast()
  const hasMountedRef = useRef(false)
  const handleLangChange = (next) => setLang(normalizeLang(next))

  useEffect(() => {
    setStoredLang(lang)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    showToast({ type: 'info', message: t('common.languageChanged') })
  }, [lang, showToast, t])

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
      onLogin={(authResponse) => {
        const token = authResponse?.token
        if (!token) return
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
