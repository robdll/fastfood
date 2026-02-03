import { ObjectId } from 'mongodb'

import { connectToDatabase } from '../db/db.js'

const COLLECTION_NAME = 'users'

const isValidObjectId = (id) => ObjectId.isValid(id)

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => item?.toString().trim()).filter(Boolean)
  }
  if (value === undefined || value === null) return []
  const normalized = value.toString().trim()
  return normalized ? [normalized] : []
}

const getUserById = async (req, res) => {
  const { id } = req.params

  if (!isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid user id.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const user = await db
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })

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
          paymentMethod: payload.clientData.paymentMethod?.toString().trim(),
          preferences: normalizeStringArray(payload.clientData.preferences),
        }
      : payload.clientData

    const user = {
      ...payload,
      clientData: normalizedClientData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(COLLECTION_NAME).insertOne(user)
    res.status(201).json({ _id: result.insertedId, ...user })
  } finally {
    await client.close()
  }
}

const updateUser = async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (!isValidObjectId(id)) {
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

    const result = await db
      .collection(COLLECTION_NAME)
      .updateOne({ _id: new ObjectId(id) }, { $set: updateDoc })

    if (result.matchedCount === 0) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    const user = await db
      .collection(COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })

    res.json(user)
  } finally {
    await client.close()
  }
}

const deleteUser = async (req, res) => {
  const { id } = req.params

  if (!isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid user id.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const result = await db
      .collection(COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })

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
