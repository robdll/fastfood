import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'menus'

const buildRestaurantQuery = (restaurantId) => {
  const normalized = restaurantId?.toString().trim()
  if (!normalized) return null
  const candidates = [{ restaurantId: normalized }]
  if (ObjectId.isValid(normalized)) {
    candidates.push({ restaurantId: new ObjectId(normalized) })
  }
  return { $or: candidates }
}

const findMenuByRestaurantId = async (db, restaurantId) => {
  const query = buildRestaurantQuery(restaurantId)
  if (!query) return null
  return db.collection(COLLECTION_NAME).findOne(query)
}

const createMenuForRestaurant = async (db, restaurantId) => {
  const normalized = restaurantId?.toString().trim()
  const menu = {
    restaurantId: normalized,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const result = await db.collection(COLLECTION_NAME).insertOne(menu)
  return { _id: result.insertedId, ...menu }
}

const ensureMenuForRestaurant = async (db, restaurantId) => {
  const existing = await findMenuByRestaurantId(db, restaurantId)
  if (existing) return existing
  return createMenuForRestaurant(db, restaurantId)
}

export {
  COLLECTION_NAME,
  createMenuForRestaurant,
  ensureMenuForRestaurant,
  findMenuByRestaurantId,
}
