import { connectToDatabase } from '../db/db.js'
import { listMeals } from '../models/mealsDao.js'

const getMeals = async (req, res) => {
  const { client, db } = await connectToDatabase()

  try {
    const meals = await listMeals(db)

    res.json(meals)
  } finally {
    await client.close()
  }
}

export { getMeals }
