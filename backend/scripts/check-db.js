const { connectToDatabase, DB_NAME } = require('../db/db')

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
  // eslint-disable-next-line no-console
  console.error('MongoDB connection failed:', error)
  process.exit(1)
})
