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
  subtotal,
  deliveryFee,
  total,
  expectedMinutes,
  isEstimateLoading,
  hasEstimateError,
  formatPrice,
  lang,
  t,
}) {
  const renderCurrency = (value) =>
    value === null || value === undefined ? '—' : formatPrice(value)

  const renderEta = () => {
    if (deliveryOption === 'pickup') {
      return t('clientCart.recapEtaPickup')
    }
    if (isEstimateLoading) return t('common.loading')
    if (hasEstimateError || !expectedMinutes) return '—'
    return t('clientCart.recapEtaMinutes', { minutes: expectedMinutes })
  }

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
      <div className="cartRecap">
        <h4>{t('clientCart.recapTitle')}</h4>
        <div className="cartRecap__row">
          <span>{t('clientCart.recapSubtotal')}</span>
          <strong>{renderCurrency(subtotal)}</strong>
        </div>
        {deliveryOption === 'delivery' && (
          <div className="cartRecap__row">
            <span>{t('clientCart.recapDeliveryFee')}</span>
            <strong>{renderCurrency(deliveryFee)}</strong>
          </div>
        )}
        <div className="cartRecap__row cartRecap__row--total">
          <span>{t('clientCart.recapTotal')}</span>
          <strong>
            {deliveryOption === 'delivery' ? renderCurrency(total) : renderCurrency(subtotal)}
          </strong>
        </div>
        <div className="cartRecap__row">
          <span>{t('clientCart.recapEta')}</span>
          <strong>{renderEta()}</strong>
        </div>
      </div>
      <button className="btn btn--primary" type="button" disabled={isDisabled}>
        {t('clientCart.checkoutAction')}
      </button>
    </section>
  )
}

export default CartCheckout
