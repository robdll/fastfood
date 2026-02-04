import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import useToast from '../hooks/useToast'
import {
  getRestaurantById,
  getRestaurantMenuById,
} from '../data/mockRestaurants'
import { addCartItem } from '../utils/cart'
import '../components/MenuTable/MenuTable.css'

function ClientRestaurantMenu({
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const restaurant = useMemo(
    () => getRestaurantById(restaurantId),
    [restaurantId]
  )
  const menuItems = useMemo(
    () => getRestaurantMenuById(restaurantId),
    [restaurantId]
  )

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === '') return '—'
    const numeric = Number(value)
    if (!Number.isNaN(numeric)) {
      try {
        return new Intl.NumberFormat(lang, {
          style: 'currency',
          currency: 'EUR',
        }).format(numeric)
      } catch (error) {
        return `€ ${numeric}`
      }
    }
    return value.toString()
  }

  const getOriginLabel = (origin) =>
    origin === 'catalog'
      ? t('dashboard.menuOriginCatalog')
      : t('dashboard.menuOriginCustom')

  const handleAddToCart = (item) => {
    if (!restaurant) return
    addCartItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      itemId: item.id,
      name: item.name,
      price: item.price ?? 0,
    })
    showToast({
      type: 'success',
      message: t('clientMenu.addedToCart', { name: item.name }),
    })
  }

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/client/restaurants"
        items={[
          { label: t('dashboard.clientTitle'), to: '/dashboard/client' },
          { label: t('clientRestaurants.title'), to: '/dashboard/client/restaurants' },
          { label: restaurant?.name ?? t('clientMenu.unknownRestaurant') },
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
          <section className="card menuCard">
            <div className="menuHeader">
              <div>
                <h2>{restaurant?.name ?? t('clientMenu.title')}</h2>
                <p className="muted">
                  {restaurant
                    ? t('clientMenu.body', { address: restaurant.address })
                    : t('clientMenu.notFound')}
                </p>
              </div>
              <div className="menuActions">
                <Link className="btn btn--secondary" to="/dashboard/client/cart">
                  {t('clientMenu.goToCart')}
                </Link>
              </div>
            </div>
            <div className="menuTableWrapper">
              <table className="menuTable">
                <thead>
                  <tr>
                    <th>{t('dashboard.menuTableImage')}</th>
                    <th>{t('dashboard.menuTableName')}</th>
                    <th>{t('dashboard.menuTableType')}</th>
                    <th>{t('dashboard.menuTablePrice')}</th>
                    <th>{t('dashboard.menuTableOrigin')}</th>
                    <th>{t('clientMenu.tableActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.length === 0 ? (
                    <tr>
                      <td className="menuEmpty" colSpan={6}>
                        {t('clientMenu.empty')}
                      </td>
                    </tr>
                  ) : (
                    menuItems.map((item) => (
                      <tr key={item.id} className="menuRow">
                        <td>
                          <div className="menuThumb">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} />
                            ) : (
                              <span>{t('dashboard.menuNoImage')}</span>
                            )}
                          </div>
                        </td>
                        <td>{item.name}</td>
                        <td>{item.category ?? '—'}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{getOriginLabel(item.origin)}</td>
                        <td className="menuTable__actions">
                          <button
                            className="btn btn--sky menuRow__action"
                            type="button"
                            onClick={() => handleAddToCart(item)}
                          >
                            {t('clientMenu.addToCart')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!restaurant && (
              <div className="menuActions">
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => navigate('/dashboard/client/restaurants')}
                >
                  {t('clientMenu.backToRestaurants')}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default ClientRestaurantMenu
