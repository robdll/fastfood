const { MongoClient } = require('mongodb')

const {
  MONGODB_URI = '',
  MONGO_URI = '',
  MONGODB_DB_USER = '',
  MONGODB_DB_PASSWORD = '',
  MONGODB_CLUSTER_HOST = '',
  MONGODB_APP_NAME = 'FastFoodCluster0',
} = process.env
const DB_NAME = process.env.MONGODB_DB_NAME || 'fastfood'

const buildMongoUri = () => {
  if (MONGO_URI) {
    return MONGO_URI
  }

  if (MONGODB_URI) {
    return MONGODB_URI
  }

  if (!MONGODB_DB_USER || !MONGODB_DB_PASSWORD || !MONGODB_CLUSTER_HOST) {
    throw new Error(
      'Missing Mongo env vars. Set MONGODB_URI or MONGODB_DB_USER, MONGODB_DB_PASSWORD, MONGODB_CLUSTER_HOST.'
    )
  }

  return `mongodb+srv://${encodeURIComponent(
    MONGODB_DB_USER
  )}:${encodeURIComponent(
    MONGODB_DB_PASSWORD
  )}@${MONGODB_CLUSTER_HOST}/?appName=${encodeURIComponent(MONGODB_APP_NAME)}`
}

const connectToDatabase = async () => {
  const mongoUri = buildMongoUri()

  const client = new MongoClient(mongoUri)
  await client.connect()

  return {
    client,
    db: client.db(DB_NAME),
  }
}

module.exports = {
  connectToDatabase,
  DB_NAME,
}
