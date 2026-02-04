import { useMemo, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import Navbar from '../components/Navbar/Navbar'
import OrderCard from '../components/Orders/OrderCard'
import OrdersList from '../components/Orders/OrdersList'
import useToast from '../hooks/useToast'
import { getOrders, updateOrderStatus } from '../utils/orders'

function ClientOrders({
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const { showToast } = useToast()
  const [orders, setOrders] = useState(() => getOrders())

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

  const handleMarkDelivered = (orderId) => {
    if (!orderId) return
    const updated = updateOrderStatus(orderId, 'delivered')
    setOrders(updated)
    showToast({
      type: 'success',
      message: t('clientOrders.statusUpdatedDelivered'),
    })
  }
  const tableLabels = {
    item: t('clientOrders.tableItem'),
    qty: t('clientOrders.tableQty'),
    unit: t('clientOrders.tableUnit'),
    total: t('clientOrders.tableTotal'),
  }

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
              <OrdersList>
                {sortedOrders.map((order, index) => {
                  const orderId = resolveOrderId(order)
                  const orderKey = orderId ?? index
                  const deliveryOption = order?.deliveryOption ?? 'pickup'
                  const canMarkDelivered =
                    deliveryOption === 'delivery' &&
                    order?.status === 'readyForPickup'
                  const action = canMarkDelivered ? (
                    <button
                      className="btn btn--secondary orderCard__actionBtn"
                      type="button"
                      onClick={() => handleMarkDelivered(orderId)}
                    >
                      {t('clientOrders.markDelivered')}
                    </button>
                  ) : null
                  const metaItems = [
                    {
                      label: t('clientOrders.orderType'),
                      value:
                        deliveryOption === 'delivery'
                          ? t('clientOrders.typeDelivery')
                          : t('clientOrders.typePickup'),
                    },
                    {
                      label: t('clientOrders.deliveryFee'),
                      value: formatPrice(order.deliveryFee),
                    },
                    {
                      label: t('clientOrders.eta'),
                      value:
                        deliveryOption === 'delivery' && order.expectedMinutes
                          ? t('clientOrders.etaMinutes', {
                              minutes: order.expectedMinutes,
                            })
                          : '—',
                    },
                    {
                      label: t('clientOrders.total'),
                      value: formatPrice(order.total),
                    },
                  ]
                  return (
                    <OrderCard
                      key={orderKey}
                      title={
                        order.restaurantName ?? t('clientOrders.unknownRestaurant')
                      }
                      subtitle={t('clientOrders.placedOn', {
                        date: formatDate(order.createdAt),
                      })}
                      statusText={statusLabel(order.status)}
                      action={action}
                      metaItems={metaItems}
                      itemsTitle={t('clientOrders.itemsTitle')}
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

export default ClientOrders
