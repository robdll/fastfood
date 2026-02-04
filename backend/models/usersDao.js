import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'users'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const isValidUserId = (id) => ObjectId.isValid(id)

const findUserById = async (db, id) =>
  db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) })

const insertUser = async (db, user) => {
  const result = await db.collection(COLLECTION_NAME).insertOne(user)
  return { _id: result.insertedId, ...user }
}

const updateUserById = async (db, id, updateDoc) =>
  db
    .collection(COLLECTION_NAME)
    .updateOne({ _id: new ObjectId(id) }, { $set: updateDoc })

const deleteUserById = async (db, id) =>
  db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })

const findActiveUserByEmail = async (db, email) =>
  db.collection(COLLECTION_NAME).findOne({
    email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
    active: { $ne: false },
  })

export {
  COLLECTION_NAME,
  deleteUserById,
  findActiveUserByEmail,
  findUserById,
  insertUser,
  isValidUserId,
  updateUserById,
}
