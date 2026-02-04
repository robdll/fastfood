import { useMemo, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import OrderCard from '../components/Orders/OrderCard'
import OrdersList from '../components/Orders/OrdersList'
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

  const handleUpdateStatus = (orderId, nextStatus) => {
    if (!orderId || !nextStatus) return
    const updated = updateOrderStatus(orderId, nextStatus)
    setOrders(updated)
    const messageKey =
      nextStatus === 'preparation'
        ? 'restaurantOrders.statusUpdatedPreparation'
        : nextStatus === 'delivered'
          ? 'restaurantOrders.statusUpdatedDelivered'
          : 'restaurantOrders.statusUpdatedReadyForPickup'
    showToast({
      type: 'success',
      message: t(messageKey),
    })
  }

  const tableLabels = {
    item: t('restaurantOrders.tableItem'),
    qty: t('restaurantOrders.tableQty'),
    unit: t('restaurantOrders.tableUnit'),
    total: t('restaurantOrders.tableTotal'),
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
              <OrdersList>
                {sortedOrders.map((order, index) => {
                  const orderId = resolveOrderId(order)
                  const orderKey = orderId ?? index
                  const isOrdered = order?.status === 'ordered'
                  const isPreparation = order?.status === 'preparation'
                  const deliveryOption = order?.deliveryOption ?? 'pickup'
                  const action = isOrdered ? (
                    <button
                      className="btn btn--secondary orderCard__actionBtn"
                      type="button"
                      onClick={() => handleUpdateStatus(orderId, 'preparation')}
                    >
                      {t('restaurantOrders.markPreparation')}
                    </button>
                  ) : isPreparation ? (
                    <button
                      className="btn btn--secondary orderCard__actionBtn"
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(
                          orderId,
                          deliveryOption === 'delivery'
                            ? 'readyForPickup'
                            : 'delivered'
                        )
                      }
                    >
                      {deliveryOption === 'delivery'
                        ? t('restaurantOrders.markReady')
                        : t('restaurantOrders.markDelivered')}
                    </button>
                  ) : null
                  const metaItems = [
                    {
                      label: t('restaurantOrders.orderType'),
                      value:
                        deliveryOption === 'delivery'
                          ? t('restaurantOrders.typeDelivery')
                          : t('restaurantOrders.typePickup'),
                    },
                    {
                      label: t('restaurantOrders.deliveryAddress'),
                      value:
                        deliveryOption === 'delivery' && order?.deliveryAddress
                          ? order.deliveryAddress
                          : '—',
                    },
                    {
                      label: t('restaurantOrders.payment'),
                      value: paymentLabel(order?.paymentMethod),
                    },
                    {
                      label: t('restaurantOrders.eta'),
                      value:
                        deliveryOption === 'delivery' && order?.expectedMinutes
                          ? t('restaurantOrders.etaMinutes', {
                              minutes: order.expectedMinutes,
                            })
                          : '—',
                    },
                    {
                      label: t('restaurantOrders.subtotal'),
                      value: formatPrice(order.subtotal),
                    },
                    {
                      label: t('restaurantOrders.deliveryFee'),
                      value: formatPrice(order.deliveryFee),
                    },
                    {
                      label: t('restaurantOrders.total'),
                      value: formatPrice(order.total),
                    },
                  ]
                  return (
                    <OrderCard
                      key={orderKey}
                      title={t('restaurantOrders.orderLabel', {
                        id: orderId ?? '—',
                      })}
                      subtitle={t('restaurantOrders.placedOn', {
                        date: formatDate(order.createdAt),
                      })}
                      statusText={statusLabel(order.status)}
                      action={action}
                      metaItems={metaItems}
                      itemsTitle={t('restaurantOrders.itemsTitle')}
                      items={order.items ?? []}
                      orderKey={orderKey}
                      formatPrice={formatPrice}
                      tableLabels={tableLabels}
                    />
                  )
                })}
              </OrdersList>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default RestaurantOrders
