import OrderItemsTable from '../OrderItemsTable/OrderItemsTable'
import './OrderCard.css'

function OrderCard({
  title,
  subtitle,
  statusText,
  action,
  metaItems = [],
  itemsTitle,
  items = [],
  orderKey,
  formatPrice,
  tableLabels,
}) {
  return (
    <article className="card orderCard">
      <div className="orderCard__header">
        <h3>{title}</h3>
        {subtitle && <p className="muted">{subtitle}</p>}
        <div className="orderCard__actions">
          <span className="orderCard__status">{statusText}</span>
          {action}
        </div>
      </div>
      <div className="orderCard__meta">
        {metaItems.map((item, index) => (
          <div key={`${orderKey}-meta-${index}`}>
            <span className="muted">{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
      <div className="orderCard__items">
        <h4>{itemsTitle}</h4>
        <OrderItemsTable
          items={items}
          orderKey={orderKey}
          formatPrice={formatPrice}
          labels={tableLabels}
        />
      </div>
    </article>
  )
}

export default OrderCard
