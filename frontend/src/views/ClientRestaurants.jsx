import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import Spinner from '../components/Spinner/Spinner'
import { getRestaurants } from '../services/restaurants'
import '../components/MenuTable/MenuTable.css'

function ClientRestaurants({
  token,
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false

    async function loadRestaurants() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getRestaurants(
          token,
          t('clientRestaurants.error')
        )
        if (!cancelled) setRestaurants(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setRestaurants([])
          setError(err?.message ?? t('clientRestaurants.error'))
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadRestaurants()
    return () => {
      cancelled = true
    }
  }, [token, t])

  const rows = useMemo(
    () =>
      restaurants.map((restaurant) => ({
        id: restaurant._id ?? restaurant.id,
        name: restaurant.name ?? '—',
        address: restaurant.address ?? '—',
        phone: restaurant.phone ?? '—',
      })),
    [restaurants]
  )

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
            {isLoading && (
              <p className="muted">
                <Spinner
                  className="spinner--inline"
                  label={t('clientRestaurants.loading')}
                />
              </p>
            )}
            {error && <p className="menuError">{error}</p>}
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
                  {!isLoading && rows.length === 0 ? (
                    <tr>
                      <td className="menuEmpty" colSpan={4}>
                        {t('clientRestaurants.empty')}
                      </td>
                    </tr>
                  ) : (
                    rows.map((restaurant) => (
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
