import { connectToDatabase } from '../db/db.js'
import {
  findRestaurantById,
  findRestaurants,
  isValidUserId,
} from '../models/usersDao.js'

const toRestaurantPayload = (user) => ({
  _id: user?._id,
  name: user?.restaurantData?.name ?? 'Restaurant',
  address: user?.restaurantData?.address ?? null,
  phone: user?.restaurantData?.phone ?? null,
})

const getRestaurants = async (req, res) => {
  const { client, db } = await connectToDatabase()

  try {
    const restaurants = await findRestaurants(db)
    res.json(restaurants.map(toRestaurantPayload))
  } finally {
    await client.close()
  }
}

const getRestaurantById = async (req, res) => {
  const { id } = req.params

  if (!id) {
    res.status(400).json({ error: 'Restaurant id is required.' })
    return
  }

  if (!isValidUserId(id)) {
    res.status(400).json({ error: 'Invalid restaurant id.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const restaurant = await findRestaurantById(db, id)
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found.' })
      return
    }
    res.json(toRestaurantPayload(restaurant))
  } finally {
    await client.close()
  }
}

export { getRestaurantById, getRestaurants }
