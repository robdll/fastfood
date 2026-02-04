import { connectToDatabase } from '../db/db.js'

const COLLECTION_NAME = 'meals'

const getMeals = async (req, res) => {
  const { client, db } = await connectToDatabase()

  try {
    const meals = await db
      .collection(COLLECTION_NAME)
      .find({})
      .project({ strMeal: 1, idMeal: 1, strCategory: 1 })
      .sort({ strMeal: 1 })
      .toArray()

    res.json(meals)
  } finally {
    await client.close()
  }
}

export { getMeals }
