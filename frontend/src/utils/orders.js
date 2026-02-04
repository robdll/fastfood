const ORDERS_KEY = 'fastfood-orders'

const readOrders = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Unable to read orders', error)
    return []
  }
}

const writeOrders = (orders) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

const getOrders = () => readOrders()

const addOrders = (orders) => {
  const nextOrders = Array.isArray(orders) ? orders : []
  const existing = readOrders()
  const updated = [...nextOrders, ...existing]
  writeOrders(updated)
  return updated
}

const clearOrders = () => writeOrders([])

export { addOrders, clearOrders, getOrders }
