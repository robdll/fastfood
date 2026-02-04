import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'orders'

const insertOrders = async (db, orders) => {
  const result = await db.collection(COLLECTION_NAME).insertMany(orders)
  return orders.map((order, index) => ({
    _id: result.insertedIds[index],
    ...order,
  }))
}

const findOrdersByClientId = async (db, clientId) =>
  db
    .collection(COLLECTION_NAME)
    .find({ clientId })
    .sort({ createdAt: -1 })
    .toArray()

const findOrderById = async (db, orderId) => {
  if (!ObjectId.isValid(orderId)) return null
  return db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(orderId) })
}

const updateOrderStatusById = async (db, orderId, status, updatedAt) => {
  if (!ObjectId.isValid(orderId)) return null
  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(orderId) },
    { $set: { status, updatedAt } },
    { returnDocument: 'after' }
  )
  return result?.value ?? null
}

const countPreparationByRestaurantIds = async (db, restaurantIds) => {
  const pipeline = [
    { $match: { restaurantId: { $in: restaurantIds }, status: 'ordered' } },
    { $group: { _id: '$restaurantId', count: { $sum: 1 } } },
  ]
  const results = await db.collection(COLLECTION_NAME).aggregate(pipeline).toArray()
  return results.reduce((acc, entry) => {
    acc[entry._id] = entry.count
    return acc
  }, {})
}

export {
  COLLECTION_NAME,
  countPreparationByRestaurantIds,
  findOrderById,
  findOrdersByClientId,
  insertOrders,
  updateOrderStatusById,
}
