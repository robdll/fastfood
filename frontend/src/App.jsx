import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  createT,
  getInitialLang,
  normalizeLang,
  setStoredLang,
} from './i18n'
import AuthForm from './components/AuthForm/AuthForm'
import Footer from './components/Footer/Footer'
import HealthCard from './components/HealthCard/HealthCard'
import HeroSection from './components/HeroSection/HeroSection'
import LandingCard from './components/LandingCard/LandingCard'
import Navbar from './components/Navbar/Navbar'

const TOKEN_KEY = 'jwt'

const getJwt = () => window.localStorage.getItem(TOKEN_KEY)
const setJwt = (token) => window.localStorage.setItem(TOKEN_KEY, token)
const clearJwt = () => window.localStorage.removeItem(TOKEN_KEY)

function useHashRoute() {
  const getRoute = () => {
    const raw = window.location.hash || '#/'
    const cleaned = raw.replace(/^#\/?/, '')
    return cleaned.length ? cleaned : '/'
  }

  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

function Landing({ health, error, onEnterApp, lang, onLangChange, t }) {
  const whatsNextList = t('landing.whatsNextList')

  return (
    <div className="landing">
      <Navbar t={t} lang={lang} onLangChange={onLangChange}>
        <button
          className="navLink navLink--button"
          type="button"
          onClick={onEnterApp}
        >
          {t('common.goToApp')}
        </button>
      </Navbar>

      <main>
        <HeroSection t={t} onEnterApp={onEnterApp} />

        <section
          id="api-health"
          className="landingSection section"
          aria-label={t('landing.sectionLabel')}
        >
          <div className="page">
            <div className="grid">
              <HealthCard health={health} error={error} t={t} />

              <LandingCard
                id="what-next-title"
                title={t('landing.whatsNextTitle')}
                body={t('landing.whatsNextBody')}
                items={Array.isArray(whatsNextList) ? whatsNextList : []}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer text={t('footer.copyright')} />
    </div>
  )
}

function AppStub({ lang, onLangChange, t }) {
  return (
    <div className="landing">
      <Navbar t={t} lang={lang} onLangChange={onLangChange}>
        <a className="navLink" href="#/">
          {t('common.backToLanding')}
        </a>
      </Navbar>
      <main>
        <div className="page">
          <section className="card">
            <h2>{t('appStub.title')}</h2>
            <p className="muted">{t('appStub.body')}</p>
          </section>
        </div>
      </main>
    </div>
  )
}

function AuthPage({ onAuthSuccess, lang, onLangChange, t }) {
  return (
    <div className="landing auth">
      <Navbar t={t} lang={lang} onLangChange={onLangChange}>
        <a className="navLink" href="#/">
          {t('common.backToLanding')}
        </a>
      </Navbar>

      <main>
        <div className="page">
          <AuthForm
            t={t}
            onSubmit={() => {
              setJwt(`demo-token-${Date.now()}`)
              onAuthSuccess()
            }}
          />
        </div>
      </main>
    </div>
  )
}

function Dashboard({ onLogout, lang, onLangChange, t }) {
  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange}>
        <button
          className="navLink navLink--button"
          type="button"
          onClick={onLogout}
        >
          {t('common.logout')}
        </button>
      </Navbar>
      <main>
        <div className="page">
          <section className="card">
            <h2>{t('dashboard.title')}</h2>
            <p className="muted">{t('dashboard.body')}</p>
          </section>
        </div>
      </main>
    </div>
  )
}

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)
  const route = useHashRoute()
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

  useEffect(() => {
    if (route === 'app') {
      window.location.hash = getJwt() ? '#/dashboard' : '#/auth'
    }
    if (route === 'dashboard' && !getJwt()) {
      window.location.hash = '#/auth'
    }
  }, [route])

  if (route === 'auth') {
    return (
      <AuthPage
        onAuthSuccess={() => {
          window.location.hash = '#/dashboard'
        }}
        lang={lang}
        onLangChange={handleLangChange}
        t={t}
      />
    )
  }

  if (route === 'dashboard') {
    return (
      <Dashboard
        onLogout={() => {
          clearJwt()
          window.location.hash = '#/'
        }}
        lang={lang}
        onLangChange={handleLangChange}
        t={t}
      />
    )
  }

  if (route === 'app')
    return (
      <AppStub
        lang={lang}
        onLangChange={handleLangChange}
        t={t}
      />
    )

  return (
    <Landing
      health={health}
      error={error}
      onEnterApp={() => {
        window.location.hash = getJwt() ? '#/dashboard' : '#/auth'
      }}
      lang={lang}
      onLangChange={handleLangChange}
      t={t}
    />
  )
}

export default App
