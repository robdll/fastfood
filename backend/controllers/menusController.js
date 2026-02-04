import { ObjectId } from 'mongodb'

import { connectToDatabase } from '../db/db.js'
import { isPlainObject } from '../utils/utils.js'
import { COLLECTION_NAME, ensureMenuForRestaurant } from '../models/menusDao.js'
import { uploadImage } from '../utils/cloudinary.js'

const getMenuByRestaurantId = async (req, res) => {
  const { restaurantId } = req.params

  if (!restaurantId) {
    res.status(400).json({ error: 'Restaurant id is required.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const menu = await ensureMenuForRestaurant(db, restaurantId)
    const items = menu?.items ?? []
    const mealIds = items
      .map((item) => {
        const candidate =
          item?.mealId ??
          item?.meal?._id ??
          item?.meal?.idMeal ??
          item?.idMeal ??
          null
        return candidate?.toString()
      })
      .filter(Boolean)

    if (mealIds.length === 0) {
      res.json(menu)
      return
    }

    const objectIds = mealIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id))
    const meals = await db
      .collection('meals')
      .find({
        $or: [
          ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : []),
          { idMeal: { $in: mealIds } },
        ],
      })
      .project({ _id: 1, idMeal: 1, origin: 1 })
      .toArray()

    const mealOriginById = new Map()
    meals.forEach((meal) => {
      if (meal?._id) {
        mealOriginById.set(meal._id.toString(), meal.origin)
      }
      if (meal?.idMeal) {
        mealOriginById.set(meal.idMeal.toString(), meal.origin)
      }
    })

    const enrichedItems = items.map((item) => {
      if (item?.origin && item.origin !== 'catalog') return item
      const lookupId =
        item?.mealId ??
        item?.meal?._id ??
        item?.meal?.idMeal ??
        item?.idMeal ??
        null
      const origin = lookupId
        ? mealOriginById.get(lookupId.toString())
        : null
      if (!origin) return item
      return { ...item, origin }
    })

    res.json({ ...menu, items: enrichedItems })
  } finally {
    await client.close()
  }
}

const normalizeMealIds = (payload) => {
  if (!isPlainObject(payload)) return []
  if (!Array.isArray(payload.mealIds)) return []
  return payload.mealIds
    .map((id) => id?.toString().trim())
    .filter(Boolean)
}

const parseItemsPayload = (payload) => {
  if (!isPlainObject(payload)) return []
  if (Array.isArray(payload.items)) return payload.items
  if (typeof payload.items === 'string') {
    try {
      const parsed = JSON.parse(payload.items)
      if (Array.isArray(parsed)) return parsed
    } catch (error) {
      return []
    }
  }
  return []
}

const normalizeMenuItems = (items = []) =>
  items
    .map((item) => ({
      mealId: item?.mealId?.toString().trim(),
      price: item?.price,
      category: item?.category?.toString().trim(),
      removedIngredients: normalizeRemovedIngredients(item?.removedIngredients),
    }))
    .filter((item) => item.mealId)

const normalizePrice = (value) => {
  if (value === undefined || value === null || value === '') return null
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return null
  if (numeric < 0) return null
  return numeric
}

const normalizeRemovedIngredients = (value) => {
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

const buildExistingMealIdSet = (items = []) => {
  const ids = new Set()
  items.forEach((item) => {
    const candidates = [
      item?._id,
      item?.mealId,
      item?.meal?._id,
      item?.meal?.idMeal,
      item?.idMeal,
    ]
    candidates
      .filter(Boolean)
      .map((value) => value.toString())
      .forEach((value) => ids.add(value))
  })
  return ids
}

const findMenuItemIndex = (items = [], targetId) => {
  const normalized = targetId?.toString().trim()
  if (!normalized) return -1
  return items.findIndex((item) => {
    const candidates = [
      item?._id,
      item?.mealId,
      item?.meal?._id,
      item?.meal?.idMeal,
      item?.idMeal,
    ]
    return candidates
      .filter(Boolean)
      .some((value) => value.toString() === normalized)
  })
}

const addMenuItems = async (req, res) => {
  const { restaurantId } = req.params

  if (!restaurantId) {
    res.status(400).json({ error: 'Restaurant id is required.' })
    return
  }

  if (req.auth?.userId && req.auth.userId !== restaurantId) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }

  const payloadItems = parseItemsPayload(req.body)
  const normalizedItems = normalizeMenuItems(payloadItems)
  const normalizedIds =
    normalizedItems.length > 0 ? normalizedItems.map((item) => item.mealId) : []
  const legacyIds = normalizedIds.length > 0 ? [] : normalizeMealIds(req.body)
  const mealIds = normalizedIds.length > 0 ? normalizedIds : legacyIds

  if (mealIds.length === 0) {
    res.status(400).json({ error: 'Menu items are required.' })
    return
  }

  const payloadById = new Map(
    normalizedItems.map((item) => [item.mealId, item])
  )
  const files = Array.isArray(req.files) ? req.files : []
  const photoByMealId = new Map()
  files.forEach((file) => {
    if (file.fieldname?.startsWith('photo_')) {
      const mealId = file.fieldname.replace('photo_', '')
      if (mealId) photoByMealId.set(mealId, file)
    }
  })

  const { client, db } = await connectToDatabase()

  try {
    const menu = await ensureMenuForRestaurant(db, restaurantId)
    const existingIds = buildExistingMealIdSet(menu.items ?? [])
    const uniqueIds = Array.from(new Set(mealIds))
    const pendingIds = uniqueIds.filter((id) => !existingIds.has(id))

    if (pendingIds.length === 0) {
      res.json(menu)
      return
    }

    const objectIds = pendingIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id))
    const query = {
      $or: [
        ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : []),
        { idMeal: { $in: pendingIds } },
      ],
    }

    const meals = await db
      .collection('meals')
      .find(query)
      .project({
        strMeal: 1,
        idMeal: 1,
        strCategory: 1,
        strMealThumb: 1,
        origin: 1,
      })
      .toArray()

    const mealById = new Map()
    meals.forEach((meal) => {
      if (meal?._id) {
        mealById.set(meal._id.toString(), meal)
      }
      if (meal?.idMeal) {
        mealById.set(meal.idMeal.toString(), meal)
      }
    })

    const itemsToAdd = []
    for (const id of pendingIds) {
      const meal = mealById.get(id)
      if (!meal) continue
      const payload = payloadById.get(id)
      const normalizedPrice = normalizePrice(payload?.price)
      if (normalizedPrice === null) {
        res.status(400).json({ error: 'Price is required for each menu item.' })
        return
      }
      const normalizedCategory = payload?.category?.toString().trim()
      const normalizedRemovedIngredients = normalizeRemovedIngredients(
        payload?.removedIngredients
      )

      const file = photoByMealId.get(id)
      let photoUrl = null
      let photoPublicId = null
      if (file) {
        const uploadResult = await uploadImage(file, {
          folder: 'fastfood/menu',
        })
        photoUrl = uploadResult?.secure_url ?? null
        photoPublicId = uploadResult?.public_id ?? null
      } else if (meal?.strMealThumb) {
        photoUrl = meal.strMealThumb
      } else {
        res.status(400).json({ error: 'Photo is required for each menu item.' })
        return
      }

      const normalizedOrigin = meal?.origin?.toString().trim()
      itemsToAdd.push({
        mealId: meal._id?.toString() ?? meal.idMeal?.toString(),
        name: meal.strMeal ?? 'Meal',
        category: normalizedCategory || meal.strCategory || null,
        origin: normalizedOrigin || 'catalog',
        price: normalizedPrice,
        photoUrl,
        photoPublicId,
        removedIngredients: normalizedRemovedIngredients,
        ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
        measures: Array.isArray(meal.measures) ? meal.measures : [],
        createdAt: new Date(),
      })
    }

    if (itemsToAdd.length === 0) {
      res.json(menu)
      return
    }

    const updatedAt = new Date()
    const updatedItems = [...(menu.items ?? []), ...itemsToAdd]

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: menu._id },
      {
        $set: {
          items: updatedItems,
          updatedAt,
        },
      }
    )

    res.json({
      ...menu,
      items: updatedItems,
      updatedAt,
    })
  } finally {
    await client.close()
  }
}

const updateMenuItem = async (req, res) => {
  const { restaurantId, mealId } = req.params

  if (!restaurantId || !mealId) {
    res.status(400).json({ error: 'Restaurant id and meal id are required.' })
    return
  }

  if (req.auth?.userId && req.auth.userId !== restaurantId) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }

  const body = req.body ?? {}
  const hasPriceField = Object.prototype.hasOwnProperty.call(body, 'price')
  const normalizedPrice = hasPriceField ? normalizePrice(body.price) : null
  const hasCategoryField = Object.prototype.hasOwnProperty.call(body, 'category')
  const normalizedCategory = hasCategoryField
    ? body.category?.toString().trim()
    : null
  const hasRemovedIngredientsField = Object.prototype.hasOwnProperty.call(
    body,
    'removedIngredients'
  )
  const normalizedRemovedIngredients = hasRemovedIngredientsField
    ? normalizeRemovedIngredients(body.removedIngredients)
    : []
  if (hasPriceField && normalizedPrice === null) {
    res.status(400).json({ error: 'Price is required to update the dish.' })
    return
  }
  if (hasCategoryField && !normalizedCategory) {
    res.status(400).json({ error: 'Category is required to update the dish.' })
    return
  }

  const files = Array.isArray(req.files) ? req.files : []
  const photoFile = files.find((file) => file.fieldname === 'photo')

  if (!hasPriceField && !photoFile && !hasCategoryField && !hasRemovedIngredientsField) {
    res.status(400).json({ error: 'At least one update is required.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const menu = await ensureMenuForRestaurant(db, restaurantId)
    const items = menu.items ?? []
    const targetIndex = findMenuItemIndex(items, mealId)
    if (targetIndex < 0) {
      res.status(404).json({ error: 'Menu item not found.' })
      return
    }

    const updatedItem = { ...items[targetIndex] }

    if (hasPriceField) {
      updatedItem.price = normalizedPrice
    }

    if (hasCategoryField) {
      updatedItem.category = normalizedCategory
    }

    if (hasRemovedIngredientsField) {
      updatedItem.removedIngredients = normalizedRemovedIngredients
    }

    if (photoFile) {
      const uploadResult = await uploadImage(photoFile, {
        folder: 'fastfood/menu',
      })
      updatedItem.photoUrl = uploadResult?.secure_url ?? null
      updatedItem.photoPublicId = uploadResult?.public_id ?? null
    }

    const updatedAt = new Date()
    const updatedItems = [...items]
    updatedItems[targetIndex] = updatedItem

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: menu._id },
      {
        $set: {
          items: updatedItems,
          updatedAt,
        },
      }
    )

    res.json({
      ...menu,
      items: updatedItems,
      updatedAt,
    })
  } finally {
    await client.close()
  }
}

const deleteMenuItem = async (req, res) => {
  const { restaurantId, mealId } = req.params

  if (!restaurantId || !mealId) {
    res.status(400).json({ error: 'Restaurant id and meal id are required.' })
    return
  }

  if (req.auth?.userId && req.auth.userId !== restaurantId) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const menu = await ensureMenuForRestaurant(db, restaurantId)
    const items = menu.items ?? []
    const targetIndex = findMenuItemIndex(items, mealId)
    if (targetIndex < 0) {
      res.status(404).json({ error: 'Menu item not found.' })
      return
    }

    const updatedItems = items.filter((_, index) => index !== targetIndex)
    const updatedAt = new Date()

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: menu._id },
      {
        $set: {
          items: updatedItems,
          updatedAt,
        },
      }
    )

    res.json({
      ...menu,
      items: updatedItems,
      updatedAt,
    })
  } finally {
    await client.close()
  }
}

export { addMenuItems, deleteMenuItem, getMenuByRestaurantId, updateMenuItem }
