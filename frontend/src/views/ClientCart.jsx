import { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import CartCheckout from '../components/CartCheckout/CartCheckout'
import CartSummary from '../components/CartSummary/CartSummary'
import Modal from '../components/Modal/Modal'
import Navbar from '../components/Navbar/Navbar'
import {
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from '../utils/cart'
import '../components/MenuTable/MenuTable.css'

function ClientCart({
  user,
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const [items, setItems] = useState(() => getCartItems())
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const preferred = user?.clientData?.paymentMethod
    return ['delivery', 'cards', 'coupons'].includes(preferred)
      ? preferred
      : 'delivery'
  })
  const [deliveryOption, setDeliveryOption] = useState('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [pendingRemoval, setPendingRemoval] = useState(null)

  const handleIncrease = (item) => {
    const nextQuantity = (item.quantity ?? 1) + 1
    const updated = updateCartItemQuantity(
      item.restaurantId,
      item.itemId,
      nextQuantity
    )
    setItems(updated)
  }

  const handleDecrease = (item) => {
    const currentQty = item.quantity ?? 1
    if (currentQty <= 1) {
      setPendingRemoval(item)
      return
    }
    const updated = updateCartItemQuantity(
      item.restaurantId,
      item.itemId,
      currentQty - 1
    )
    setItems(updated)
  }

  const handleRemoveConfirm = () => {
    if (!pendingRemoval) return
    const updated = removeCartItem(
      pendingRemoval.restaurantId,
      pendingRemoval.itemId
    )
    setItems(updated)
    setPendingRemoval(null)
  }

  const handleRemoveCancel = () => {
    setPendingRemoval(null)
  }

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

  const isCheckoutDisabled =
    items.length === 0 ||
    (deliveryOption === 'delivery' && !deliveryAddress.trim())

  return (
    <div className="landing dashboard">
      <Navbar t={t} lang={lang} onLangChange={onLangChange} />
      <Breadcrumbs
        t={t}
        backTo="/dashboard/client"
        items={[
          { label: t('dashboard.clientTitle'), to: '/dashboard/client' },
          { label: t('clientCart.title') },
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
          <CartSummary
            items={items}
            t={t}
            formatPrice={formatPrice}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
          />
          <CartCheckout
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            deliveryOption={deliveryOption}
            onDeliveryOptionChange={setDeliveryOption}
            deliveryAddress={deliveryAddress}
            onDeliveryAddressChange={setDeliveryAddress}
            isDisabled={isCheckoutDisabled}
            lang={lang}
            t={t}
          />
        </div>
      </main>
      <Modal
        isOpen={Boolean(pendingRemoval)}
        title={t('clientCart.removeTitle')}
        description={t('clientCart.removeDescription')}
        submitLabel={t('clientCart.removeConfirm')}
        cancelLabel={t('clientCart.removeCancel')}
        submitVariant="danger"
        onSubmit={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
    </div>
  )
}

export default ClientCart
