import './HealthCard.css'
import Spinner from '../Spinner/Spinner'

function HealthCard({ health, error, t }) {
  return (
    <section className="card" aria-labelledby="api-health-title">
      <h2 id="api-health-title">{t('health.title')}</h2>
      <p className="muted">{t('health.description')}</p>

      {error ? (
        <p className="health__error">{error}</p>
      ) : health ? (
        <pre className="health__pre">{JSON.stringify(health, null, 2)}</pre>
      ) : (
        <p className="muted">
          <Spinner className="spinner--inline" label={t('health.loading')} />
        </p>
      )}
    </section>
  )
}

export default HealthCard
