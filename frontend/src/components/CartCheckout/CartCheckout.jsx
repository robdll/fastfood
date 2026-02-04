import AddressPicker from '../AddressPicker/AddressPicker'
import './CartCheckout.css'

const PAYMENT_OPTIONS = ['delivery', 'cards', 'coupons']

function CartCheckout({
  paymentMethod,
  onPaymentMethodChange,
  deliveryOption,
  onDeliveryOptionChange,
  deliveryAddress,
  onDeliveryAddressChange,
  isDisabled,
  lang,
  t,
}) {
  return (
    <section className="card cartForm">
      <h3>{t('clientCart.checkoutTitle')}</h3>
      <p className="muted">{t('clientCart.checkoutBody')}</p>
      <div className="cartForm__row">
        <label className="cartForm__field">
          <span>{t('clientCart.paymentMethod')}</span>
          <select
            className="input"
            value={paymentMethod}
            onChange={(event) => onPaymentMethodChange(event.target.value)}
          >
            {PAYMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`auth.payment${option[0].toUpperCase()}${option.slice(1)}`)}
              </option>
            ))}
          </select>
        </label>
        <div className="cartForm__field">
          <span>{t('clientCart.deliveryMethod')}</span>
          <div className="cartForm__options">
            <label className="cartForm__option">
              <input
                type="radio"
                name="delivery-option"
                value="delivery"
                checked={deliveryOption === 'delivery'}
                onChange={(event) => onDeliveryOptionChange(event.target.value)}
              />
              <span>{t('clientCart.deliveryOption')}</span>
            </label>
            <label className="cartForm__option">
              <input
                type="radio"
                name="delivery-option"
                value="pickup"
                checked={deliveryOption === 'pickup'}
                onChange={(event) => onDeliveryOptionChange(event.target.value)}
              />
              <span>{t('clientCart.pickupOption')}</span>
            </label>
          </div>
        </div>
      </div>
      {deliveryOption === 'delivery' && (
        <div className="cartForm__field cartForm__field--full">
          <label htmlFor="deliveryAddress">
            {t('clientCart.deliveryAddress')}
          </label>
          <AddressPicker
            inputId="deliveryAddress"
            value={deliveryAddress}
            onChange={onDeliveryAddressChange}
            t={t}
            lang={lang}
          />
          {!deliveryAddress?.trim() && (
            <span className="tiny errorText" role="status">
              {t('clientCart.deliveryAddressRequired')}
            </span>
          )}
        </div>
      )}
      <button className="btn btn--primary" type="button" disabled={isDisabled}>
        {t('clientCart.checkoutAction')}
      </button>
    </section>
  )
}

export default CartCheckout
