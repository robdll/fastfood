import { useMemo } from 'react'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import { getOrders } from '../utils/orders'

function ClientOrders({
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const orders = useMemo(() => getOrders(), [])

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

  const formatDate = (value) => {
    if (!value) return '—'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return parsed.toLocaleString(lang)
  }

  const statusLabel = (status) => {
    if (!status) return '—'
    return t(`clientOrders.status${status[0].toUpperCase()}${status.slice(1)}`)
  }

  const sortedOrders = useMemo(() => {
    const copy = Array.isArray(orders) ? [...orders] : []
    return copy.sort((a, b) => {
      const aTime = a?.createdAt ? Date.parse(a.createdAt) : 0
      const bTime = b?.createdAt ? Date.parse(b.createdAt) : 0
      return bTime - aTime
    })
  }, [orders])
  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/client"
        items={[
          { label: t('dashboard.clientTitle'), to: '/dashboard/client' },
          { label: t('clientOrders.title') },
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
            <h2>{t('clientOrders.title')}</h2>
            <p className="muted">{t('clientOrders.body')}</p>
            {sortedOrders.length === 0 ? (
              <p className="muted">{t('clientOrders.empty')}</p>
            ) : (
              <div className="ordersList">
                {sortedOrders.map((order) => (
                  <article key={order.id} className="card orderCard">
                    <div className="orderCard__header">
                      <div>
                        <h3>{order.restaurantName ?? t('clientOrders.unknownRestaurant')}</h3>
                        <p className="muted">
                          {t('clientOrders.placedOn', {
                            date: formatDate(order.createdAt),
                          })}
                        </p>
                      </div>
                      <span className="orderCard__status">
                        {statusLabel(order.status)}
                      </span>
                    </div>
                    <div className="orderCard__meta">
                      <div>
                        <span className="muted">{t('clientOrders.orderType')}</span>
                        <strong>
                          {order.deliveryOption === 'delivery'
                            ? t('clientOrders.typeDelivery')
                            : t('clientOrders.typePickup')}
                        </strong>
                      </div>
                      <div>
                        <span className="muted">{t('clientOrders.deliveryFee')}</span>
                        <strong>{formatPrice(order.deliveryFee)}</strong>
                      </div>
                      <div>
                        <span className="muted">{t('clientOrders.eta')}</span>
                        <strong>
                          {order.deliveryOption === 'delivery' && order.expectedMinutes
                            ? t('clientOrders.etaMinutes', {
                                minutes: order.expectedMinutes,
                              })
                            : '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="muted">{t('clientOrders.total')}</span>
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                    </div>
                    <div className="orderCard__items">
                      <h4>{t('clientOrders.itemsTitle')}</h4>
                      <ul>
                        {(order.items ?? []).map((item) => (
                          <li key={`${order.id}-${item.itemId}`}>
                            <span>
                              {item.quantity ?? 1}× {item.name ?? '—'}
                            </span>
                            <strong>
                              {formatPrice((item.price ?? 0) * (item.quantity ?? 1))}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default ClientOrders
