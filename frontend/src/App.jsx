import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

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
    <>
      <h1>Fastfood Monorepo</h1>
      <p>Frontend (Vite + React) talking to Backend (Express).</p>

      <div className="card">
        <h2>API health</h2>
        {error ? (
          <p style={{ color: 'crimson' }}>{error}</p>
        ) : health ? (
          <pre style={{ textAlign: 'left' }}>{JSON.stringify(health, null, 2)}</pre>
        ) : (
          <p>Loading…</p>
        )}
      </div>
    </>
  )
}

export default App
