const getMealIngredients = (meal) => {
  if (!meal) return []
  if (Array.isArray(meal.ingredients)) {
    return meal.ingredients
      .map((name, index) => ({
        name: name?.toString().trim() ?? '',
        measure: Array.isArray(meal.measures)
          ? meal.measures[index]?.toString().trim() ?? ''
          : '',
      }))
      .filter((item) => item.name)
  }

  const ingredients = []
  for (let index = 1; index <= 20; index += 1) {
    const name = meal[`strIngredient${index}`]
    const measure = meal[`strMeasure${index}`]
    if (name && name.toString().trim()) {
      ingredients.push({
        name: name.toString().trim(),
        measure: measure ? measure.toString().trim() : '',
      })
    }
  }
  return ingredients
}

export { getMealIngredients }
