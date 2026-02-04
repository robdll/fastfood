import { useMemo } from 'react'
import '../MenuTable/MenuTable.css'
import './CartSummary.css'

function CartSummary({ items, t, formatPrice, onIncrease, onDecrease }) {
  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 1),
        0
      ),
    [items]
  )

  return (
    <section className="card">
      <h2>{t('clientCart.title')}</h2>
      <p className="muted">{t('clientCart.body')}</p>
      <div className="menuTableWrapper">
        <table className="menuTable">
          <thead>
            <tr>
              <th>{t('clientCart.tableRestaurant')}</th>
              <th>{t('clientCart.tableItem')}</th>
              <th className="cartTableQty">{t('clientCart.tableQty')}</th>
              <th className="cartTablePrice">{t('clientCart.tablePrice')}</th>
              <th className="cartTableTotal">{t('clientCart.tableTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="menuEmpty" colSpan={5}>
                  {t('clientCart.empty')}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={`${item.restaurantId}-${item.itemId}`}>
                  <td>{item.restaurantName}</td>
                  <td>{item.name}</td>
                  <td>
                    <div className="cartQtyControl">
                      <button
                        className="cartQtyButton"
                        type="button"
                        aria-label={t('clientCart.decreaseQty')}
                        onClick={() => onDecrease?.(item)}
                      >
                        -
                      </button>
                      <span className="cartQtyValue">{item.quantity ?? 1}</span>
                      <button
                        className="cartQtyButton"
                        type="button"
                        aria-label={t('clientCart.increaseQty')}
                        onClick={() => onIncrease?.(item)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{formatPrice((item.price ?? 0) * (item.quantity ?? 1))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="cartTotals">
        <span>{t('clientCart.subtotal')}</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>
    </section>
  )
}

export default CartSummary
