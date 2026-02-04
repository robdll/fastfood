import OrderItemsTable from '../OrderItemsTable/OrderItemsTable'
import './RestaurantOrderCard.css'

function RestaurantOrderCard({
  order,
  orderId,
  orderKey,
  formatDate,
  formatPrice,
  statusLabel,
  paymentLabel,
  onMarkReady,
  t,
}) {
  const isPreparation = order?.status === 'preparation'
  const deliveryOption = order?.deliveryOption ?? 'pickup'
  return (
    <article className="card orderCard">
      <div className="orderCard__header">
        <div>
          <h3>
            {t('restaurantOrders.orderLabel', {
              id: orderId ?? '—',
            })}
          </h3>
          <p className="muted">
            {t('restaurantOrders.placedOn', {
              date: formatDate(order.createdAt),
            })}
          </p>
        </div>
        <div className="orderCard__actions">
          <span className="orderCard__status">{statusLabel(order.status)}</span>
          {isPreparation && (
            <button
              className="btn btn--secondary orderCard__actionBtn"
              type="button"
              onClick={() => onMarkReady(orderId)}
            >
              {t('restaurantOrders.markReady')}
            </button>
          )}
        </div>
      </div>
      <div className="orderCard__meta">
        <div>
          <span className="muted">{t('restaurantOrders.orderType')}</span>
          <strong>
            {deliveryOption === 'delivery'
              ? t('restaurantOrders.typeDelivery')
              : t('restaurantOrders.typePickup')}
          </strong>
        </div>
        <div>
          <span className="muted">{t('restaurantOrders.deliveryAddress')}</span>
          <strong>
            {deliveryOption === 'delivery' && order?.deliveryAddress
              ? order.deliveryAddress
              : '—'}
          </strong>
        </div>
        <div>
          <span className="muted">{t('restaurantOrders.payment')}</span>
          <strong>{paymentLabel(order?.paymentMethod)}</strong>
        </div>
        <div>
          <span className="muted">{t('restaurantOrders.eta')}</span>
          <strong>
            {deliveryOption === 'delivery' && order?.expectedMinutes
              ? t('restaurantOrders.etaMinutes', {
                  minutes: order.expectedMinutes,
                })
              : '—'}
          </strong>
        </div>
        <div>
          <span className="muted">{t('restaurantOrders.subtotal')}</span>
          <strong>{formatPrice(order.subtotal)}</strong>
        </div>
        <div>
          <span className="muted">{t('restaurantOrders.deliveryFee')}</span>
          <strong>{formatPrice(order.deliveryFee)}</strong>
        </div>
        <div>
          <span className="muted">{t('restaurantOrders.total')}</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </div>
      <div className="orderCard__items">
        <h4>{t('restaurantOrders.itemsTitle')}</h4>
        <OrderItemsTable
          items={order.items ?? []}
          orderKey={orderKey}
          formatPrice={formatPrice}
          t={t}
        />
      </div>
    </article>
  )
}

export default RestaurantOrderCard
