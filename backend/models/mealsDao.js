const COLLECTION_NAME = 'meals'

const listMeals = async (db) =>
  db
    .collection(COLLECTION_NAME)
    .find({})
    .project({ strMeal: 1, idMeal: 1, strCategory: 1 })
    .sort({ strMeal: 1 })
    .toArray()

export { COLLECTION_NAME, listMeals }
