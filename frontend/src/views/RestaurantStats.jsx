import { useMemo } from 'react'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import { getOrders } from '../utils/orders'

function RestaurantStats({
  user,
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const restaurantId = user?._id ?? null
  const orders = useMemo(() => getOrders(), [])

  const restaurantOrders = useMemo(() => {
    if (!restaurantId) return []
    return orders.filter((order) => order?.restaurantId === restaurantId)
  }, [orders, restaurantId])

  const orderCount = restaurantOrders.length

  const totalGains = useMemo(
    () =>
      restaurantOrders.reduce((acc, order) => {
        const numeric = Number(order?.total ?? order?.subtotal ?? 0)
        return acc + (Number.isFinite(numeric) ? numeric : 0)
      }, 0),
    [restaurantOrders]
  )

  const mostSoldItems = useMemo(() => {
    const counts = new Map()
    restaurantOrders.forEach((order) => {
      ;(order?.items ?? []).forEach((item) => {
        const key = item?.itemId ?? item?.id ?? item?.name ?? '—'
        const name =
          item?.name ??
          (typeof key === 'string' ? key : key?.toString() ?? '—')
        const quantity = Number(item?.quantity ?? 1)
        const entry = counts.get(key) ?? { count: 0, name }
        const increment = Number.isFinite(quantity) ? quantity : 1
        entry.count += increment
        if (!entry.name && name) entry.name = name
        counts.set(key, entry)
      })
    })
    return [...counts.entries()]
      .map(([key, entry]) => ({
        key,
        count: entry.count,
        name: entry.name ?? (typeof key === 'string' ? key : key?.toString() ?? '—'),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [restaurantOrders])

  const bestCustomer = useMemo(() => {
    const nameByClientId = new Map()
    restaurantOrders.forEach((order) => {
      const clientId = order?.clientId?.toString().trim()
      const name = order?.clientName?.toString().trim()
      if (clientId && name) {
        nameByClientId.set(clientId, name)
      }
    })

    const totals = new Map()
    restaurantOrders.forEach((order) => {
      const clientId = order?.clientId?.toString().trim()
      const resolvedName =
        order?.clientName?.toString().trim() ||
        (clientId ? nameByClientId.get(clientId) : '') ||
        order?.customerName?.toString().trim() ||
        t('restaurantStats.unknownCustomer')
      const value = Number(order?.total ?? order?.subtotal ?? 0)
      const total = totals.get(resolvedName) ?? 0
      totals.set(resolvedName, total + (Number.isFinite(value) ? value : 0))
    })
    if (totals.size === 0) return null
    let topKey = null
    let topValue = -1
    totals.forEach((value, key) => {
      if (value > topValue) {
        topValue = value
        topKey = key
      }
    })
    if (!topKey) return null
    return { name: topKey.toString(), total: topValue }
  }, [restaurantOrders, t])

  const formatPrice = (value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return '—'
    try {
      return new Intl.NumberFormat(lang, {
        style: 'currency',
        currency: 'EUR',
      }).format(numeric)
    } catch (error) {
      return `€ ${numeric}`
    }
  }

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/restaurant"
        items={[
          { label: t('dashboard.restaurantTitle'), to: '/dashboard/restaurant' },
          { label: t('restaurantStats.title') },
        ]}
        userMenu={{
          settingsPath: '/settings',
          onLogout,
          showSwitch: canSwitch,
          switchPath,
          switchLabel: t('dashboard.switchToClient'),
        }}
      />
      <main>
        <div className="page">
          <section className="card">
            <h2>{t('restaurantStats.title')}</h2>
            <p className="muted">{t('restaurantStats.body')}</p>
            <div className="grid statsGrid">
              <article className="card statsCard">
                <p className="statsCard__label">{t('restaurantStats.orders')}</p>
                <p className="statsCard__value">{orderCount}</p>
              </article>
              <article className="card statsCard">
                <p className="statsCard__label">{t('restaurantStats.totalGains')}</p>
                <p className="statsCard__value">{formatPrice(totalGains)}</p>
              </article>
              <article className="card statsCard">
                <p className="statsCard__label">{t('restaurantStats.bestCustomer')}</p>
                <p className="statsCard__value">
                  {bestCustomer
                    ? `${bestCustomer.name} (${formatPrice(bestCustomer.total)})`
                    : t('restaurantStats.empty')}
                </p>
              </article>
              <article className="card statsCard statsCard--full">
                <p className="statsCard__label">{t('restaurantStats.mostSold')}</p>
                {mostSoldItems.length === 0 ? (
                  <p className="muted">{t('restaurantStats.empty')}</p>
                ) : (
                  <ul className="statsList">
                    {mostSoldItems.map((item) => (
                      <li key={item.key}>
                        {item.name} · {t('restaurantStats.soldCount', { count: item.count })}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default RestaurantStats
