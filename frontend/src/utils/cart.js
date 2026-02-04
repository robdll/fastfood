const CART_KEY = 'fastfood-cart'

const readCart = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Unable to read cart', error)
    return []
  }
}

const writeCart = (items) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
}

const getCartItems = () => readCart()

const addCartItem = (item) => {
  const items = readCart()
  const existingIndex = items.findIndex(
    (entry) =>
      entry.restaurantId === item.restaurantId && entry.itemId === item.itemId
  )

  if (existingIndex >= 0) {
    const updated = [...items]
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: (updated[existingIndex].quantity ?? 1) + (item.quantity ?? 1),
    }
    writeCart(updated)
    return updated
  }

  const next = [
    ...items,
    {
      ...item,
      quantity: item.quantity ?? 1,
    },
  ]
  writeCart(next)
  return next
}

const clearCart = () => writeCart([])

export { addCartItem, clearCart, getCartItems }
