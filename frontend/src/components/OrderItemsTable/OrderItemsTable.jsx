import '../MenuTable/MenuTable.css'

function OrderItemsTable({ items = [], orderKey, formatPrice, t }) {
  return (
    <div className="menuTableWrapper">
      <table className="menuTable orderItemsTable">
          <thead>
            <tr>
              <th>{t('restaurantOrders.tableItem')}</th>
              <th>{t('restaurantOrders.tableQty')}</th>
              <th>{t('restaurantOrders.tableUnit')}</th>
              <th>{t('restaurantOrders.tableTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const quantity = item?.quantity ?? 1
              const price = item?.price ?? 0
              return (
                <tr key={`${orderKey}-${item?.itemId ?? index}`}>
                  <td>{item?.name ?? '—'}</td>
                  <td>{quantity}</td>
                  <td>{formatPrice(price)}</td>
                  <td>{formatPrice(price * quantity)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
    </div>
  )
}

export default OrderItemsTable
