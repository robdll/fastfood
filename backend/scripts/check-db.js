import { connectToDatabase, DB_NAME } from '../db/db.js'

const checkDatabaseConnection = async () => {
  const { client, db } = await connectToDatabase()

  try {
    await db.admin().ping()
    console.log(`MongoDB connection OK. Using database: ${DB_NAME}`)
  } finally {
    await client.close()
  }
}

checkDatabaseConnection().catch((error) => {
  console.error('MongoDB connection failed:', error)
  process.exit(1)
})
