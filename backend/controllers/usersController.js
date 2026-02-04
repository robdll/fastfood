import { connectToDatabase } from '../db/db.js'
import {
  deleteUserById,
  findUserById,
  insertUser,
  isValidUserId,
  updateUserById,
} from '../models/usersDao.js'
import { getFormValues, isPlainObject } from '../utils/utils.js'

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => item?.toString().trim()).filter(Boolean)
  }
  if (value === undefined || value === null) return []
  const normalized = value.toString().trim()
  return normalized ? [normalized] : []
}

const normalizeRestaurantData = (value) => {
  if (!isPlainObject(value)) return value
  const normalized = getFormValues(value, ['name', 'phone', 'vat', 'address'])
  return {
    ...value,
    ...normalized,
  }
}

const getUserById = async (req, res) => {
  const { id } = req.params

  if (req.auth?.userId && req.auth.userId !== id) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }

  if (!isValidUserId(id)) {
    res.status(400).json({ error: 'Invalid user id.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const user = await findUserById(db, id)

    if (!user) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    res.json(user)
  } finally {
    await client.close()
  }
}

const createUser = async (req, res) => {
  const payload = req.body

  if (!isPlainObject(payload) || Object.keys(payload).length === 0) {
    res.status(400).json({ error: 'User payload is required.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const normalizedClientData = isPlainObject(payload.clientData)
      ? {
          ...payload.clientData,
          paymentMethod: getFormValues(payload.clientData, ['paymentMethod'])
            .paymentMethod,
          preferences: normalizeStringArray(payload.clientData.preferences),
        }
      : payload.clientData

    const user = {
      ...payload,
      clientData: normalizedClientData,
      active: payload.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await insertUser(db, user)
    res.status(201).json(created)
  } finally {
    await client.close()
  }
}

const updateUser = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (req.auth?.userId && req.auth.userId !== id) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }

  if (!isValidUserId(id)) {
    res.status(400).json({ error: 'Invalid user id.' })
    return
  }

  if (!isPlainObject(updates) || Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'User payload is required.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const updateDoc = {
      ...updates,
      updatedAt: new Date(),
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'clientData')) {
      updateDoc.clientData = isPlainObject(updates.clientData)
        ? {
            ...updates.clientData,
            paymentMethod: getFormValues(updates.clientData, ['paymentMethod'])
              .paymentMethod,
            preferences: normalizeStringArray(updates.clientData.preferences),
          }
        : updates.clientData
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'restaurantData')) {
      updateDoc.restaurantData = normalizeRestaurantData(updates.restaurantData)
    }

    const result = await updateUserById(db, id, updateDoc)

    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    const user = await findUserById(db, id)

    res.json(user)
  } finally {
    await client.close()
  }
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  if (req.auth?.userId && req.auth.userId !== id) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }

  if (!isValidUserId(id)) {
    res.status(400).json({ error: 'Invalid user id.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const result = await deleteUserById(db, id)

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    res.json({ deleted: true })
  } finally {
    await client.close()
  }
}

export { createUser, deleteUser, getUserById, updateUser }
