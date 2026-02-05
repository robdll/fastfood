import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ObjectId } from 'mongodb'

import { connectToDatabase, DB_NAME } from '../db/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SEED_FILES = {
  meals: path.join(__dirname, '..', 'db', 'meal.json'),
  users: path.join(__dirname, '..', 'db', 'users.json'),
  menus: path.join(__dirname, '..', 'db', 'menus.json'),
  orders: path.join(__dirname, '..', 'db', 'orders.json'),
}

const isIsoDate = (value) => {
  if (typeof value !== 'string') return false
  const parsed = Date.parse(value)
  return Number.isFinite(parsed)
}

const normalizeValue = (value, key) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item, key))
  }
  if (value && typeof value === 'object') {
    if (value.$oid) {
      return new ObjectId(value.$oid)
    }
    return Object.entries(value).reduce((acc, [childKey, childValue]) => {
      acc[childKey] = normalizeValue(childValue, childKey)
      return acc
    }, {})
  }
  if (key && key.endsWith('At') && isIsoDate(value)) {
    return new Date(value)
  }
  return value
}

const readSeedArray = async (filePath) => {
  const fileContents = await fs.readFile(filePath, 'utf-8')
  const rawData = JSON.parse(fileContents)
  if (!Array.isArray(rawData)) {
    throw new Error(`${path.basename(filePath)} must contain a JSON array.`)
  }
  return rawData.map((doc) => normalizeValue(doc, ''))
}

const seedCollection = async (db, collectionName, filePath) => {
  const collection = db.collection(collectionName)
  const docs = await readSeedArray(filePath)
  await collection.deleteMany({})

  if (docs.length === 0) {
    console.log(`${path.basename(filePath)} is empty. No documents inserted.`)
    return
  }

  const result = await collection.insertMany(docs)
  console.log(
    `Seeded ${result.insertedCount} documents into ${DB_NAME}.${collectionName}.`
  )
}

const seedDatabase = async () => {
  const { client, db } = await connectToDatabase()
  try {
    for (const [collectionName, filePath] of Object.entries(SEED_FILES)) {
      await seedCollection(db, collectionName, filePath)
    }
  } finally {
    await client.close()
  }
}

seedDatabase().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
