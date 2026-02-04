import { useEffect, useMemo, useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import CartCheckout from '../components/CartCheckout/CartCheckout'
import CartSummary from '../components/CartSummary/CartSummary'
import Modal from '../components/Modal/Modal'
import Navbar from '../components/Navbar/Navbar'
import useToast from '../hooks/useToast'
import { getRestaurantById } from '../services/restaurants'
import {
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from '../utils/cart'
import { addOrders, getOrders } from '../utils/orders'
import '../components/MenuTable/MenuTable.css'

const buildSearchUrl = (query, lang) => {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '1')
  url.searchParams.set('q', query)
  if (lang) url.searchParams.set('accept-language', lang)
  return url.toString()
}

const geocodeAddress = async (address, lang) => {
  const response = await fetch(buildSearchUrl(address, lang))
  if (!response.ok) {
    throw new Error('Geocoding failed')
  }
  const data = await response.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No geocoding results')
  }
  return {
    lat: Number.parseFloat(data[0].lat),
    lng: Number.parseFloat(data[0].lon),
  }
}

const haversineKm = (from, to) => {
  const radius = 6371
  const toRadians = (value) => (value * Math.PI) / 180
  const deltaLat = toRadians(to.lat - from.lat)
  const deltaLng = toRadians(to.lng - from.lng)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return radius * c
}

function ClientCart({
  user,
  token,
  onLogout,
  canSwitch,
  switchPath,
  lang,
  onLangChange,
  t,
}) {
  const { showToast } = useToast()
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
  const [restaurantAddresses, setRestaurantAddresses] = useState({})
  const [deliveryEstimate, setDeliveryEstimate] = useState({
    fee: 0,
    expectedMinutes: null,
    isLoading: false,
    error: null,
    byRestaurant: {},
  })

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

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 1),
        0
      ),
    [items]
  )

  const groupedItems = useMemo(() => {
    const groups = new Map()
    items.forEach((item) => {
      if (!item.restaurantId) return
      const existing = groups.get(item.restaurantId)
      if (existing) {
        existing.items.push(item)
        if (!existing.restaurantName && item.restaurantName) {
          existing.restaurantName = item.restaurantName
        }
        if (!existing.restaurantAddress && item.restaurantAddress) {
          existing.restaurantAddress = item.restaurantAddress
        }
      } else {
        groups.set(item.restaurantId, {
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName ?? '',
          restaurantAddress: item.restaurantAddress ?? '',
          items: [item],
        })
      }
    })
    return Array.from(groups.values())
  }, [items])

  const restaurantIds = useMemo(
    () => [...new Set(items.map((item) => item.restaurantId).filter(Boolean))],
    [items]
  )

  useEffect(() => {
    if (items.length === 0) return
    setRestaurantAddresses((prev) => {
      const next = { ...prev }
      items.forEach((item) => {
        if (item.restaurantId && item.restaurantAddress && !next[item.restaurantId]) {
          next[item.restaurantId] = item.restaurantAddress
        }
      })
      return next
    })
  }, [items])

  useEffect(() => {
    if (!token || restaurantIds.length === 0) return
    let cancelled = false

    const loadMissingAddresses = async () => {
      const missing = restaurantIds.filter((id) => !restaurantAddresses[id])
      if (missing.length === 0) return
      try {
        const results = await Promise.all(
          missing.map((id) => getRestaurantById(id, token, t('clientMenu.error')))
        )
        if (cancelled) return
        setRestaurantAddresses((prev) => {
          const next = { ...prev }
          results.forEach((restaurant) => {
            const id = restaurant?._id ?? restaurant?.id
            if (id && restaurant?.address && !next[id]) {
              next[id] = restaurant.address
            }
          })
          return next
        })
      } catch (error) {
        if (!cancelled) {
          console.error('Unable to load restaurant addresses', error)
        }
      }
    }

    loadMissingAddresses()
    return () => {
      cancelled = true
    }
  }, [restaurantAddresses, restaurantIds, t, token])

  useEffect(() => {
    let cancelled = false
    const shouldEstimate =
      deliveryOption === 'delivery' &&
      deliveryAddress.trim() &&
      restaurantIds.length > 0

    if (!shouldEstimate) {
      setDeliveryEstimate({
        fee: deliveryOption === 'delivery' ? null : 0,
        expectedMinutes: null,
        isLoading: false,
        error: null,
        byRestaurant: {},
      })
      return () => {
        cancelled = true
      }
    }

    const missingAddresses = restaurantIds.filter((id) => !restaurantAddresses[id])
    if (missingAddresses.length > 0) {
      setDeliveryEstimate({
        fee: null,
        expectedMinutes: null,
        isLoading: false,
        error: 'missing-address',
        byRestaurant: {},
      })
      return () => {
        cancelled = true
      }
    }

    const estimateDelivery = async () => {
      setDeliveryEstimate((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))
      try {
        const deliveryCoords = await geocodeAddress(deliveryAddress.trim(), lang)
        const existingOrders = getOrders()
        const preparationCounts = existingOrders.reduce((acc, order) => {
          if (order?.status === 'preparation' && order?.restaurantId) {
            acc[order.restaurantId] = (acc[order.restaurantId] ?? 0) + 1
          }
          return acc
        }, {})
        const estimates = await Promise.all(
          restaurantIds.map(async (id) => {
            const coords = await geocodeAddress(restaurantAddresses[id], lang)
            const distanceKm = haversineKm(coords, deliveryCoords)
            const roundedKm = Math.ceil(distanceKm)
            const fee = Math.max(1, roundedKm * 0.5)
            const baseMinutes = 30 + roundedKm * 1.5
            const extraMinutes = (preparationCounts[id] ?? 0) * 5
            const minutes = baseMinutes + extraMinutes
            return { restaurantId: id, fee, minutes }
          })
        )
        if (cancelled) return
        const deliveryFee = estimates.reduce((acc, entry) => acc + entry.fee, 0)
        const expectedMinutes = estimates.reduce(
          (acc, entry) => Math.max(acc, entry.minutes),
          0
        )
        const byRestaurant = estimates.reduce((acc, entry) => {
          acc[entry.restaurantId] = { fee: entry.fee, minutes: entry.minutes }
          return acc
        }, {})
        setDeliveryEstimate({
          fee: deliveryFee,
          expectedMinutes,
          isLoading: false,
          error: null,
          byRestaurant,
        })
      } catch (error) {
        if (cancelled) return
        console.error('Unable to estimate delivery', error)
        setDeliveryEstimate({
          fee: null,
          expectedMinutes: null,
          isLoading: false,
          error: 'geocode',
          byRestaurant: {},
        })
      }
    }

    estimateDelivery()
    return () => {
      cancelled = true
    }
  }, [deliveryAddress, deliveryOption, lang, restaurantAddresses, restaurantIds])

  const deliveryFee =
    deliveryOption === 'delivery' ? deliveryEstimate.fee : 0
  const total = deliveryFee === null ? null : subtotal + deliveryFee
  const expectedMinutes =
    deliveryOption === 'delivery' ? deliveryEstimate.expectedMinutes : null

  const isCheckoutDisabled =
    items.length === 0 ||
    (deliveryOption === 'delivery' && !deliveryAddress.trim())

  const createOrderId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `order-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }

  const handleCheckout = () => {
    if (isCheckoutDisabled || items.length === 0) return
    const createdAt = new Date().toISOString()
    const trimmedAddress = deliveryAddress.trim()
    const orders = groupedItems.map((group) => {
      const orderSubtotal = group.items.reduce(
        (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 1),
        0
      )
      const estimate =
        deliveryOption === 'delivery'
          ? deliveryEstimate.byRestaurant?.[group.restaurantId]
          : null
      const deliveryFeeForOrder =
        deliveryOption === 'delivery' ? estimate?.fee ?? null : 0
      const expectedMinutesForOrder =
        deliveryOption === 'delivery' ? estimate?.minutes ?? null : null
      const orderTotal =
        deliveryOption === 'delivery'
          ? deliveryFeeForOrder === null
            ? null
            : orderSubtotal + deliveryFeeForOrder
          : orderSubtotal
      return {
        id: createOrderId(),
        createdAt,
        status: 'preparation',
        restaurantId: group.restaurantId,
        restaurantName: group.restaurantName,
        restaurantAddress: group.restaurantAddress,
        items: group.items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price ?? 0,
          quantity: item.quantity ?? 1,
        })),
        subtotal: orderSubtotal,
        deliveryFee: deliveryFeeForOrder,
        total: orderTotal,
        expectedMinutes: expectedMinutesForOrder,
        deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? trimmedAddress : '',
        paymentMethod,
      }
    })
    addOrders(orders)
    clearCart()
    setItems([])
    showToast({ type: 'success', message: t('clientCart.checkoutSuccess') })
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
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            expectedMinutes={expectedMinutes}
            isEstimateLoading={deliveryEstimate.isLoading}
            hasEstimateError={Boolean(deliveryEstimate.error)}
            formatPrice={formatPrice}
            lang={lang}
            t={t}
            onCheckout={handleCheckout}
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
