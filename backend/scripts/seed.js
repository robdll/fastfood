const fs = require('fs/promises')
const path = require('path')
const { ObjectId } = require('mongodb')

const { connectToDatabase, DB_NAME } = require('../db/db')

const SEED_FILE = path.join(__dirname, '..', 'db', 'meal.json')
const COLLECTION_NAME = 'meals'

const seedMeals = async () => {
  const fileContents = await fs.readFile(SEED_FILE, 'utf-8')
  const rawMeals = JSON.parse(fileContents)

  if (!Array.isArray(rawMeals)) {
    throw new Error('meal.json must contain a JSON array of meals.')
  }

  const meals = rawMeals.map((meal) => {
    const cleanMeal = { ...meal }

    if (cleanMeal._id && cleanMeal._id.$oid) {
      cleanMeal._id = new ObjectId(cleanMeal._id.$oid)
    }

    return cleanMeal
  })

  const { client, db } = await connectToDatabase()

  try {
    const collection = db.collection(COLLECTION_NAME)
    await collection.deleteMany({})

    if (meals.length === 0) {
      console.log('meal.json is empty. No documents inserted.')
      return
    }

    const result = await collection.insertMany(meals)
    console.log(
      `Seeded ${result.insertedCount} meals into ${DB_NAME}.${COLLECTION_NAME}.`
    )
  } finally {
    await client.close()
  }
}

seedMeals().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seeding failed:', error)
  process.exit(1)
})
