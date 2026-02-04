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

const setCartItems = (items) => {
  const safeItems = Array.isArray(items) ? items : []
  writeCart(safeItems)
  return safeItems
}

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

const updateCartItemQuantity = (restaurantId, itemId, quantity) => {
  const items = readCart()
  const updated = items.map((entry) => {
    if (entry.restaurantId !== restaurantId || entry.itemId !== itemId) {
      return entry
    }
    return {
      ...entry,
      quantity: Math.max(0, quantity ?? 0),
    }
  })
  writeCart(updated)
  return updated
}

const removeCartItem = (restaurantId, itemId) => {
  const items = readCart()
  const updated = items.filter(
    (entry) =>
      entry.restaurantId !== restaurantId || entry.itemId !== itemId
  )
  writeCart(updated)
  return updated
}

const clearCart = () => writeCart([])

export {
  addCartItem,
  clearCart,
  getCartItems,
  removeCartItem,
  setCartItems,
  updateCartItemQuantity,
}
