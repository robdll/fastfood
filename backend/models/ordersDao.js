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

const countPreparationByRestaurantIds = async (db, restaurantIds) => {
  const pipeline = [
    { $match: { restaurantId: { $in: restaurantIds }, status: 'preparation' } },
    { $group: { _id: '$restaurantId', count: { $sum: 1 } } },
  ]
  const results = await db.collection(COLLECTION_NAME).aggregate(pipeline).toArray()
  return results.reduce((acc, entry) => {
    acc[entry._id] = entry.count
    return acc
  }, {})
}

export { COLLECTION_NAME, countPreparationByRestaurantIds, findOrdersByClientId, insertOrders }
