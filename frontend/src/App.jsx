import { useEffect, useState } from 'react'
import './App.css'

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

function HealthCard({ health, error }) {
  return (
    <section className="card" aria-labelledby="api-health-title">
      <h2 id="api-health-title">API health</h2>
      <p className="muted">
        Quick sanity check that the frontend can reach the backend.
      </p>

      {error ? (
        <p className="health__error">{error}</p>
      ) : health ? (
        <pre className="health__pre">{JSON.stringify(health, null, 2)}</pre>
      ) : (
        <p className="muted">Loading…</p>
      )}
    </section>
  )
}

function Landing({ health, error, onEnterApp }) {
  return (
    <div className="landing">
      <header className="navbar">
        <div className="navInner">
          <div className="topbar">
            <div className="brand" aria-label="FastFood">
              <img
                className="brand__mark"
                src="/images/hero-cutout.png"
                alt=""
                aria-hidden="true"
              />
              <span className="brand__text">FastFood</span>
            </div>
            <button
              className="navLink navLink--button"
              type="button"
              onClick={onEnterApp}
            >
              Go to app
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="heroFull" aria-labelledby="hero-title">
          <div className="heroInner">
            <div className="container">
              <div className="hero">
                <div>
                  <h1 className="hero__title" id="hero-title">
                    Online ordering
                    <br />
                    for fast-food restaurants.
                  </h1>
                  <p className="hero__subtitle">
                    FastFood is a web app that supports the full ordering flow:
                    customers browse a restaurant menu, build a cart, place orders
                    and track status updates; restaurateurs manage menu items and
                    process incoming orders.
                  </p>

                  <ul className="hero__bullets">
                    <li>Simple, bold UI with a neobrutalist style.</li>
                    <li>Backend-first data model exposed via REST APIs.</li>
                    <li>
                      Clear separation between structure (React) and styling (CSS).
                    </li>
                  </ul>

                  <div className="hero__actions">
                    <button
                      className="btn btn--secondary"
                      type="button"
                      onClick={onEnterApp}
                    >
                      Enter the app
                    </button>
                  </div>
                </div>

                <div
                  className="hero__illus"
                  role="img"
                  aria-label="Project preview"
                >
                  <img src="/images/hero-cutout.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="api-health"
          className="landingSection section"
          aria-label="Status and info"
        >
          <div className="page">
            <div className="grid">
              <HealthCard health={health} error={error} />

              <section className="card" aria-labelledby="what-next-title">
                <h2 id="what-next-title">What’s next</h2>
                <p className="muted">
                  This is just the landing. The “real app” area is currently a stub
                  so you can already navigate via the CTA.
                </p>
                <ul className="muted">
                  <li>Auth (cliente / ristoratore)</li>
                  <li>Menu + cart + order status</li>
                  <li>Restaurant management and deliveries</li>
                </ul>
              </section>
            </div>
          </div>
        </section>
      </main>

      <footer className="siteFooter">
        <div className="siteFooter__inner">
          Copyright reserved. Student Roberto Di Lillo, Mat. 908918
        </div>
      </footer>
    </div>
  )
}

function AppStub() {
  return (
    <div className="landing">
      <header className="navbar">
        <div className="navInner">
          <div className="topbar">
            <div className="brand" aria-label="FastFood">
              <img
                className="brand__mark"
                src="/images/hero-cutout.png"
                alt=""
                aria-hidden="true"
              />
              <span className="brand__text">FastFood</span>
            </div>
            <a className="navLink" href="#/">
              ← Back to landing
            </a>
          </div>
        </div>
      </header>
      <main>
        <div className="page">
          <section className="card">
            <h2>App area (stub)</h2>
            <p className="muted">
              This route exists so the landing CTA has somewhere real to go. We’ll
              replace this with the actual app screens later.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin')
  const [roles, setRoles] = useState({
    client: true,
    restaurant: false,
  })

  const hasAnyRole = roles.client || roles.restaurant

  const handleSubmit = (event) => {
    event.preventDefault()
    setJwt(`demo-token-${Date.now()}`)
    onAuthSuccess()
  }

  return (
    <div className="landing auth">
      <header className="navbar">
        <div className="navInner">
          <div className="topbar">
            <div className="brand" aria-label="FastFood">
              <img
                className="brand__mark"
                src="/images/hero-cutout.png"
                alt=""
                aria-hidden="true"
              />
              <span className="brand__text">FastFood</span>
            </div>
            <a className="navLink" href="#/">
              ← Back to landing
            </a>
          </div>
        </div>
      </header>

      <main>
        <div className="page">
          <section className="card authCard" aria-labelledby="auth-title">
            <div className="authHeader">
              <div>
                <h2 id="auth-title">Account access</h2>
                <p className="muted">
                  Registrati come cliente, ristoratore, oppure entrambi.
                </p>
              </div>
              <div className="segmented" role="tablist" aria-label="Auth mode">
                <button
                  type="button"
                  className={`segmented__btn ${
                    mode === 'signin' ? 'is-active' : ''
                  }`}
                  onClick={() => setMode('signin')}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className={`segmented__btn ${
                    mode === 'signup' ? 'is-active' : ''
                  }`}
                  onClick={() => setMode('signup')}
                >
                  Sign up
                </button>
              </div>
            </div>

            <form className="authForm" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <>
                  <div className="formGrid">
                    <label className="formField">
                      <span>Nome</span>
                      <input className="input" name="firstName" required />
                    </label>
                    <label className="formField">
                      <span>Cognome</span>
                      <input className="input" name="lastName" required />
                    </label>
                  </div>
                </>
              )}

              <div className="formGrid">
                <label className="formField">
                  <span>Email</span>
                  <input className="input" type="email" name="email" required />
                </label>
                <label className="formField">
                  <span>Password</span>
                  <input
                    className="input"
                    type="password"
                    name="password"
                    required
                  />
                </label>
              </div>

              {mode === 'signup' && (
                <>
                  <fieldset className="formField formField--checkboxes">
                    <legend>Tipologia di utenza</legend>
                    <label className="checkboxRow">
                      <input
                        type="checkbox"
                        checked={roles.client}
                        onChange={(event) =>
                          setRoles((prev) => ({
                            ...prev,
                            client: event.target.checked,
                          }))
                        }
                      />
                      <span>Cliente</span>
                    </label>
                    <label className="checkboxRow">
                      <input
                        type="checkbox"
                        checked={roles.restaurant}
                        onChange={(event) =>
                          setRoles((prev) => ({
                            ...prev,
                            restaurant: event.target.checked,
                          }))
                        }
                      />
                      <span>Ristoratore</span>
                    </label>
                    {!hasAnyRole && (
                      <p className="helperText">Seleziona almeno una tipologia.</p>
                    )}
                  </fieldset>

                  {roles.client && (
                    <div className="card subtleCard">
                      <h3 className="miniTitle">Dati cliente</h3>
                      <label className="formField">
                        <span>Metodo di pagamento</span>
                        <input
                          className="input"
                          name="payment"
                          placeholder="Carta di credito o prepagata"
                        />
                      </label>
                      <label className="formField">
                        <span>Preferenze</span>
                        <textarea
                          className="textarea"
                          name="preferences"
                          rows={3}
                          placeholder="Es. offerte speciali, tipologia preferita"
                        />
                      </label>
                    </div>
                  )}

                  {roles.restaurant && (
                    <div className="card subtleCard">
                      <h3 className="miniTitle">Dati ristoratore</h3>
                      <div className="formGrid">
                        <label className="formField">
                          <span>Nome ristorante</span>
                          <input className="input" name="restaurantName" />
                        </label>
                        <label className="formField">
                          <span>Telefono</span>
                          <input className="input" name="restaurantPhone" />
                        </label>
                      </div>
                      <div className="formGrid">
                        <label className="formField">
                          <span>Partita IVA</span>
                          <input className="input" name="vat" />
                        </label>
                        <label className="formField">
                          <span>Indirizzo ristorante</span>
                          <input className="input" name="restaurantAddress" />
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="authFooter">
                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={mode === 'signup' && !hasAnyRole}
                >
                  {mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
                <span className="tiny muted">
                  {mode === 'signup'
                    ? 'Creiamo un profilo demo per continuare.'
                    : 'Accesso demo per ora.'}
                </span>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

function Dashboard({ onLogout }) {
  return (
    <div className="landing dashboard">
      <header className="navbar">
        <div className="navInner">
          <div className="topbar">
            <div className="brand" aria-label="FastFood">
              <img
                className="brand__mark"
                src="/images/hero-cutout.png"
                alt=""
                aria-hidden="true"
              />
              <span className="brand__text">FastFood</span>
            </div>
            <button className="navLink navLink--button" type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="page">
          <section className="card">
            <h2>Dashboard</h2>
            <p className="muted">
              Sei autenticato. Qui arriveranno i flussi cliente/ristoratore.
            </p>
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
      />
    )
  }

  if (route === 'app') return <AppStub />

  return (
    <Landing
      health={health}
      error={error}
      onEnterApp={() => {
        window.location.hash = getJwt() ? '#/dashboard' : '#/auth'
      }}
    />
  )
}

export default App
