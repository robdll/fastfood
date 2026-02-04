import { connectToDatabase } from '../db/db.js'
import { listMeals } from '../models/mealsDao.js'
import { uploadImage } from '../utils/cloudinary.js'

const parseIngredients = (value) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) => item?.toString().trim())
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => item?.toString().trim())
          .filter(Boolean)
      }
    } catch (error) {
      return []
    }
  }
  return []
}

const getMeals = async (req, res) => {
  const { client, db } = await connectToDatabase()

  try {
    const meals = await listMeals(db)

    res.json(meals)
  } finally {
    await client.close()
  }
}

const createMeal = async (req, res) => {
  const name = req.body?.name?.toString().trim()
  const category = req.body?.category?.toString().trim()
  const origin = req.body?.origin?.toString().trim()
  const ingredients = parseIngredients(req.body?.ingredients)
  const files = Array.isArray(req.files) ? req.files : []
  const photoFile = files.find((file) => file.fieldname === 'photo')
  const roles = Array.isArray(req.auth?.roles) ? req.auth.roles : []

  if (!roles.includes('restaurant')) {
    res.status(403).json({ error: 'Restaurateur role is required.' })
    return
  }
  if (!name) {
    res.status(400).json({ error: 'Name is required.' })
    return
  }
  if (!category) {
    res.status(400).json({ error: 'Category is required.' })
    return
  }
  if (!origin) {
    res.status(400).json({ error: 'Origin is required.' })
    return
  }
  if (req.auth?.userId && req.auth.userId !== origin) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }
  if (ingredients.length === 0) {
    res.status(400).json({ error: 'Ingredients are required.' })
    return
  }
  if (!photoFile) {
    res.status(400).json({ error: 'Photo is required.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const uploadResult = await uploadImage(photoFile, {
      folder: 'fastfood/meals',
    })
    const meal = {
      strMeal: name,
      strCategory: category,
      strMealThumb: uploadResult?.secure_url ?? null,
      photoPublicId: uploadResult?.public_id ?? null,
      ingredients,
      measures: [],
      origin,
      createdAt: new Date(),
    }
    const result = await db.collection('meals').insertOne(meal)
    res.status(201).json({ ...meal, _id: result.insertedId })
  } finally {
    await client.close()
  }
}

export { createMeal, getMeals }
