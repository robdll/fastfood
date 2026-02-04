import { useMemo, useState } from 'react'
import './RestaurantOrders.css'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import RestaurantOrderCard from '../components/RestaurantOrderCard/RestaurantOrderCard'
import useToast from '../hooks/useToast'
import { getOrders, updateOrderStatus } from '../utils/orders'

function RestaurantOrders({
  user,
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const { showToast } = useToast()
  const [orders, setOrders] = useState(() => getOrders())
  const restaurantId = user?._id ?? null

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

  const resolveOrderId = (order) => {
    const raw = order?._id ?? order?.id
    if (raw === null || raw === undefined) return null
    if (typeof raw === 'string' || typeof raw === 'number') return `${raw}`
    if (typeof raw === 'object' && raw.$oid) return raw.$oid
    if (typeof raw?.toString === 'function') return raw.toString()
    return null
  }

  const statusLabel = (status) => {
    if (!status) return '—'
    return t(
      `restaurantOrders.status${status[0].toUpperCase()}${status.slice(1)}`
    )
  }

  const paymentLabel = (method) => {
    if (!method) return '—'
    return t(
      `restaurantOrders.payment${method[0].toUpperCase()}${method.slice(1)}`
    )
  }

  const sortedOrders = useMemo(() => {
    const copy = Array.isArray(orders) ? [...orders] : []
    const filtered = restaurantId
      ? copy.filter((order) => order?.restaurantId === restaurantId)
      : []
    return filtered.sort((a, b) => {
      const aTime = a?.createdAt ? Date.parse(a.createdAt) : 0
      const bTime = b?.createdAt ? Date.parse(b.createdAt) : 0
      return bTime - aTime
    })
  }, [orders, restaurantId])

  const handleMarkReady = (orderId) => {
    if (!orderId) return
    const updated = updateOrderStatus(orderId, 'readyForPickup')
    setOrders(updated)
    showToast({
      type: 'success',
      message: t('restaurantOrders.statusUpdated'),
    })
  }

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/restaurant"
        items={[
          { label: t('dashboard.restaurantTitle'), to: '/dashboard/restaurant' },
          { label: t('restaurantOrders.title') },
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
            <h2>{t('restaurantOrders.title')}</h2>
            <p className="muted">{t('restaurantOrders.body')}</p>
            {sortedOrders.length === 0 ? (
              <p className="muted">{t('restaurantOrders.empty')}</p>
            ) : (
              <div className="ordersList">
                {sortedOrders.map((order, index) => {
                  const orderId = resolveOrderId(order)
                  const orderKey = orderId ?? index
                  return (
                    <RestaurantOrderCard
                      key={orderKey}
                      order={order}
                      orderId={orderId}
                      orderKey={orderKey}
                      formatDate={formatDate}
                      formatPrice={formatPrice}
                      statusLabel={statusLabel}
                      paymentLabel={paymentLabel}
                      onMarkReady={handleMarkReady}
                      t={t}
                    />
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default RestaurantOrders
