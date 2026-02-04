import { connectToDatabase } from '../db/db.js'
import {
  countPreparationByRestaurantIds,
  findOrderById,
  findOrdersByClientId,
  insertOrders,
  updateOrderStatusById,
} from '../models/ordersDao.js'

const ORDER_STATUSES = ['ordered', 'preparation', 'readyForPickup', 'delivered']

const sanitizeItems = (items) => {
  if (!Array.isArray(items)) return []
  return items
    .map((item) => ({
      itemId: item?.itemId ?? null,
      name: item?.name ?? '',
      price: Number(item?.price ?? 0),
      quantity: Math.max(1, Number(item?.quantity ?? 1)),
    }))
    .filter((item) => item.itemId && item.name)
}

const createOrders = async (req, res) => {
  const clientId = req.auth?.userId
  const orders = req.body?.orders

  if (!clientId) {
    res.status(401).json({ error: 'Authorization token is required.' })
    return
  }
  if (!Array.isArray(orders) || orders.length === 0) {
    res.status(400).json({ error: 'Orders payload is required.' })
    return
  }

  const now = new Date()
  const orderDocs = []

  for (const order of orders) {
    const restaurantId = order?.restaurantId?.toString().trim()
    const items = sanitizeItems(order?.items)
    if (!restaurantId || items.length === 0) {
      res.status(400).json({ error: 'Each order must include restaurant and items.' })
      return
    }
    const status = ORDER_STATUSES.includes(order?.status)
      ? order.status
      : 'ordered'

    orderDocs.push({
      clientId,
      restaurantId,
      restaurantName: order?.restaurantName ?? '',
      restaurantAddress: order?.restaurantAddress ?? '',
      items,
      subtotal: Number(order?.subtotal ?? 0),
      deliveryFee:
        order?.deliveryFee === null || order?.deliveryFee === undefined
          ? null
          : Number(order.deliveryFee),
      total: order?.total === null || order?.total === undefined ? null : Number(order.total),
      expectedMinutes:
        order?.expectedMinutes === null || order?.expectedMinutes === undefined
          ? null
          : Number(order.expectedMinutes),
      deliveryOption: order?.deliveryOption ?? 'pickup',
      deliveryAddress: order?.deliveryAddress ?? '',
      paymentMethod: order?.paymentMethod ?? 'delivery',
      status,
      createdAt: now,
      updatedAt: now,
    })
  }

  const { client, db } = await connectToDatabase()
  try {
    const savedOrders = await insertOrders(db, orderDocs)
    res.status(201).json({ orders: savedOrders })
  } finally {
    await client.close()
  }
}

const getOrders = async (req, res) => {
  const clientId = req.auth?.userId
  if (!clientId) {
    res.status(401).json({ error: 'Authorization token is required.' })
    return
  }

  const { client, db } = await connectToDatabase()
  try {
    const orders = await findOrdersByClientId(db, clientId)
    res.json(orders)
  } finally {
    await client.close()
  }
}

const getPreparationCounts = async (req, res) => {
  const rawIds = req.query?.restaurantIds
  const restaurantIds = Array.isArray(rawIds)
    ? rawIds.map((id) => id.toString())
    : rawIds
      ? rawIds
          .toString()
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : []

  if (restaurantIds.length === 0) {
    res.status(400).json({ error: 'restaurantIds query param is required.' })
    return
  }

  const { client, db } = await connectToDatabase()
  try {
    const counts = await countPreparationByRestaurantIds(db, restaurantIds)
    res.json({ counts })
  } finally {
    await client.close()
  }
}

const canRestaurantUpdate = (order, userId, nextStatus) => {
  if (!order || !userId || order.restaurantId !== userId) return false
  if (nextStatus === 'preparation') {
    return order.status === 'ordered'
  }
  if (nextStatus === 'readyForPickup') {
    return order.status === 'preparation' && order.deliveryOption === 'delivery'
  }
  if (nextStatus === 'delivered') {
    return order.status === 'preparation' && order.deliveryOption !== 'delivery'
  }
  return false
}

const canClientUpdate = (order, userId, nextStatus) => {
  if (!order || !userId || order.clientId !== userId) return false
  if (nextStatus !== 'delivered') return false
  return order.status === 'readyForPickup' && order.deliveryOption === 'delivery'
}

const updateOrderStatus = async (req, res) => {
  const userId = req.auth?.userId
  const roles = req.auth?.roles ?? []
  const { id } = req.params
  const nextStatus = req.body?.status

  if (!userId) {
    res.status(401).json({ error: 'Authorization token is required.' })
    return
  }
  if (!id) {
    res.status(400).json({ error: 'Order id is required.' })
    return
  }
  if (!ORDER_STATUSES.includes(nextStatus)) {
    res.status(400).json({ error: 'Invalid order status.' })
    return
  }

  const { client, db } = await connectToDatabase()
  try {
    const order = await findOrderById(db, id)
    if (!order) {
      res.status(404).json({ error: 'Order not found.' })
      return
    }

    const isRestaurant = roles.includes('restaurant')
    const isClient = roles.includes('client')
    const allowed =
      (isRestaurant && canRestaurantUpdate(order, userId, nextStatus)) ||
      (isClient && canClientUpdate(order, userId, nextStatus))

    if (!allowed) {
      res.status(403).json({ error: 'Forbidden.' })
      return
    }

    const updated = await updateOrderStatusById(db, id, nextStatus, new Date())
    res.json(updated)
  } finally {
    await client.close()
  }
}

export { createOrders, getOrders, getPreparationCounts, updateOrderStatus }
