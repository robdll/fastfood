import { connectToDatabase } from '../db/db.js'
import {
  countPreparationByRestaurantIds,
  findOrdersByClientId,
  insertOrders,
} from '../models/ordersDao.js'

const ORDER_STATUSES = ['preparation', 'readyForPickup', 'delivered']

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
      : 'preparation'

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

export { createOrders, getOrders, getPreparationCounts }
