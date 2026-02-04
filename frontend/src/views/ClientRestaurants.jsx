import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import { restaurants } from '../data/mockRestaurants'
import '../components/MenuTable/MenuTable.css'

function ClientRestaurants({
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const navigate = useNavigate()

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/client"
        items={[
          { label: t('dashboard.clientTitle'), to: '/dashboard/client' },
          { label: t('clientRestaurants.title') },
        ]}
        userMenu={{
          settingsPath: '/settings',
          onLogout,
          showSwitch: canSwitch,
          switchPath,
          switchLabel: t('dashboard.switchToRestaurant'),
        }}
      />
      <main>
        <div className="page">
          <section className="card">
            <h2>{t('clientRestaurants.title')}</h2>
            <p className="muted">{t('clientRestaurants.body')}</p>
            <div className="menuTableWrapper">
              <table className="menuTable">
                <thead>
                  <tr>
                    <th>{t('clientRestaurants.tableName')}</th>
                    <th>{t('clientRestaurants.tableAddress')}</th>
                    <th>{t('clientRestaurants.tablePhone')}</th>
                    <th>{t('clientRestaurants.tableActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.length === 0 ? (
                    <tr>
                      <td className="menuEmpty" colSpan={4}>
                        {t('clientRestaurants.empty')}
                      </td>
                    </tr>
                  ) : (
                    restaurants.map((restaurant) => (
                      <tr
                        key={restaurant.id}
                        className="menuRow"
                        onClick={() =>
                          navigate(`/dashboard/client/restaurants/${restaurant.id}`)
                        }
                      >
                        <td>{restaurant.name}</td>
                        <td>{restaurant.address}</td>
                        <td>{restaurant.phone}</td>
                        <td className="menuTable__actions">
                          <button
                            className="btn btn--secondary menuRow__action"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              navigate(
                                `/dashboard/client/restaurants/${restaurant.id}`
                              )
                            }}
                          >
                            {t('clientRestaurants.viewMenu')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default ClientRestaurants
