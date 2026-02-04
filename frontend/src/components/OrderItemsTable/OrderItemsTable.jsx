import '../MenuTable/MenuTable.css'

function OrderItemsTable({
  items = [],
  orderKey,
  formatPrice,
  labels = {
    item: 'Item',
    qty: 'Qty',
    unit: 'Unit price',
    total: 'Line total',
  },
}) {
  return (
    <div className="menuTableWrapper">
      <table className="menuTable orderItemsTable">
        <thead>
          <tr>
            <th>{labels.item}</th>
            <th>{labels.qty}</th>
            <th>{labels.unit}</th>
            <th>{labels.total}</th>
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
