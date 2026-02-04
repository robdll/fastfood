import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'

function Dashboard({
  variant = 'client',
  canSwitch,
  switchPath,
  onLogout,
  lang,
  onLangChange,
  t,
}) {
  const isClient = variant === 'client'
  const title = isClient
    ? t('dashboard.clientTitle')
    : t('dashboard.restaurantTitle')
  const body = isClient
    ? t('dashboard.clientBody')
    : t('dashboard.restaurantBody')
  const switchLabel = isClient
    ? t('dashboard.switchToRestaurant')
    : t('dashboard.switchToClient')

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        items={[{ label: title }]}
        userMenu={{
          settingsPath: '/settings',
          onLogout,
          showSwitch: canSwitch,
          switchPath,
          switchLabel,
        }}
      />
      <main>
        <div className="page">
          <section className="card">
            <h2>{title}</h2>
            <p className="muted">{body}</p>
            {canSwitch && switchPath && (
              <Link className="btn btn--secondary" to={switchPath}>
                {switchLabel}
              </Link>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
