const COLLECTION_NAME = 'meals'

const buildMealProjection = () => {
  const projection = {
    strMeal: 1,
    idMeal: 1,
    strCategory: 1,
    strMealThumb: 1,
    ingredients: 1,
    measures: 1,
  }
  for (let index = 1; index <= 20; index += 1) {
    projection[`strIngredient${index}`] = 1
    projection[`strMeasure${index}`] = 1
  }
  return projection
}

const listMeals = async (db) =>
  db
    .collection(COLLECTION_NAME)
    .find({})
    .project(buildMealProjection())
    .sort({ strMeal: 1 })
    .toArray()

export { COLLECTION_NAME, listMeals }
