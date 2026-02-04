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

const normalizeOrderId = (value) => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value}`
  }
  if (typeof value === 'object' && value.$oid) return value.$oid
  if (typeof value?.toString === 'function') return value.toString()
  return null
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

const updateOrderStatus = (orderId, status) => {
  const targetId = normalizeOrderId(orderId)
  if (!targetId) return readOrders()
  const existing = readOrders()
  const updatedAt = new Date().toISOString()
  const updated = existing.map((order) => {
    const currentId = normalizeOrderId(order?._id ?? order?.id)
    if (!currentId || currentId !== targetId) return order
    return {
      ...order,
      status,
      updatedAt,
    }
  })
  writeOrders(updated)
  return updated
}

const clearOrders = () => writeOrders([])

export { addOrders, clearOrders, getOrders, updateOrderStatus }
