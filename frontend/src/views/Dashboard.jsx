import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import DashboardCard from '../components/DashboardCard/DashboardCard'
import Navbar from '../components/Navbar/Navbar'

function Dashboard({
  variant = 'client',
  canSwitch,
  switchPath,
  onLogout,
  user,
  lang,
  onLangChange,
  t,
}) {
  const isClient = variant === 'client'
  const title = isClient
    ? t('dashboard.clientTitle')
    : t('dashboard.restaurantTitle')
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
          {isClient && (
            <section className="grid dashboardCards">
              <DashboardCard
                title={t('clientDashboard.searchTitle')}
                body={t('clientDashboard.searchBody')}
                actionLabel={t('clientDashboard.searchAction')}
                actionTo="/dashboard/client/restaurants"
                actionVariant="btn--secondary"
              />
              <DashboardCard
                title={t('clientDashboard.ordersTitle')}
                body={t('clientDashboard.ordersBody')}
                actionLabel={t('clientDashboard.ordersAction')}
                actionTo="/dashboard/client/orders"
                actionVariant="btn--sky"
              />
              <DashboardCard
                title={t('clientDashboard.cartTitle')}
                body={t('clientDashboard.cartBody')}
                actionLabel={t('clientDashboard.cartAction')}
                actionTo="/dashboard/client/cart"
                actionVariant="btn--primary"
              />
            </section>
          )}
          {!isClient && (
            <section className="grid dashboardCards">
              <DashboardCard
                title={t('dashboard.menuTitle')}
                body={t('dashboard.menuBody')}
                actionLabel={t('dashboard.menuAction')}
                actionTo="/dashboard/restaurant/menu"
                actionVariant="btn--secondary"
              />
              <DashboardCard
                title={t('dashboard.ordersTitle')}
                body={t('dashboard.ordersBody')}
                actionLabel={t('dashboard.ordersAction')}
                actionTo="/dashboard/restaurant/orders"
                actionVariant="btn--sky"
              />
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
