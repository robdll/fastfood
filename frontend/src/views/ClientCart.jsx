import { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import CartCheckout from '../components/CartCheckout/CartCheckout'
import CartSummary from '../components/CartSummary/CartSummary'
import Navbar from '../components/Navbar/Navbar'
import { getCartItems } from '../utils/cart'
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
  const [items] = useState(() => getCartItems())
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const preferred = user?.clientData?.paymentMethod
    return ['delivery', 'cards', 'coupons'].includes(preferred)
      ? preferred
      : 'delivery'
  })
  const [deliveryOption, setDeliveryOption] = useState('delivery')

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
          <CartSummary items={items} t={t} formatPrice={formatPrice} />
          <CartCheckout
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            deliveryOption={deliveryOption}
            onDeliveryOptionChange={setDeliveryOption}
            isDisabled={items.length === 0}
            t={t}
          />
        </div>
      </main>
    </div>
  )
}

export default ClientCart
