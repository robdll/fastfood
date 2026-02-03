import { useEffect, useState } from 'react'
import './App.css'

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

function Landing({ health, error }) {
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
            <a className="navLink" href="#/app">
              Go to app
            </a>
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
                      onClick={() => {
                        window.location.hash = '#/app'
                      }}
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

  if (route === 'app') return <AppStub />
  return <Landing health={health} error={error} />
}

export default App
