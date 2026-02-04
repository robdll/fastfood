import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  createT,
  getInitialLang,
  normalizeLang,
  setStoredLang,
} from './i18n'
import AppRoutes from './routes/AppRoutes'
import {
  clearJwt,
  getJwt,
  getJwtPayload,
  getUserIdFromJwt,
  setJwt,
} from './utils/auth'
import useToast from './hooks/useToast'
import { getUserById } from './services/users'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)
  const [jwt, setJwtState] = useState(getJwt)
  const [user, setUser] = useState(null)
  const isAuthed = Boolean(jwt)
  const [lang, setLang] = useState(getInitialLang)
  const t = useMemo(() => createT(lang), [lang])
  const jwtPayload = useMemo(() => getJwtPayload(jwt), [jwt])
  const { showToast } = useToast()
  const hasMountedRef = useRef(false)
  const handleLangChange = (next) => setLang(normalizeLang(next))
  const handleLogin = (authResponse) => {
    const token = authResponse?.token
    if (!token) return
    setJwt(token)
    setJwtState(token)
    setUser(authResponse?.user ?? null)
  }
  const handleLogout = () => {
    clearJwt()
    setJwtState(null)
    setUser(null)
    showToast({ type: 'success', message: t('common.logoutSuccess') })
  }

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

  useEffect(() => {
    let cancelled = false

    if (!jwt) {
      setUser(null)
      return () => {
        cancelled = true
      }
    }

    const userId = getUserIdFromJwt(jwt)
    if (!userId) {
      setUser(null)
      return () => {
        cancelled = true
      }
    }

    async function loadUser() {
      try {
        const profile = await getUserById(userId, jwt)
        if (!cancelled) setUser(profile)
      } catch (err) {
        if (!cancelled) {
          setUser(null)
          showToast({
            type: 'error',
            message: err?.message ?? t('common.profileError'),
          })
        }
      }
    }

    loadUser()
    return () => {
      cancelled = true
    }
  }, [jwt, showToast, t])

  return (
    <AppRoutes
      health={health}
      error={error}
      isAuthed={isAuthed}
      user={user}
      token={jwt}
      fallbackRoles={jwtPayload?.roles ?? []}
      lang={lang}
      onLangChange={handleLangChange}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onUserUpdate={(nextUser) => {
        setUser(nextUser)
      }}
      t={t}
    />
  )
}

export default App
