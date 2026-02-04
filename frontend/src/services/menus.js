const getMenuByRestaurantId = async (
  restaurantId,
  token,
  fallbackMessage = 'Unable to load menu.'
) => {
  const response = await fetch(`/api/menus/${restaurantId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    let message = fallbackMessage
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch (error) {
      console.error('Menu response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

const addMenuItems = async (
  restaurantId,
  token,
  items,
  fallbackMessage = 'Unable to update menu.'
) => {
  const formData = new FormData()
  const payloadItems = items.map(({ mealId, price, category, removedIngredients }) => ({
    mealId,
    price,
    category,
    removedIngredients,
  }))
  formData.append('items', JSON.stringify(payloadItems))
  items.forEach((item) => {
    if (item.photo) {
      formData.append(`photo_${item.mealId}`, item.photo)
    }
  })

  const response = await fetch(`/api/menus/${restaurantId}/items`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    let message = fallbackMessage
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch (error) {
      console.error('Menu update response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

const updateMenuItem = async (
  restaurantId,
  mealId,
  token,
  updates,
  fallbackMessage = 'Unable to update the dish.'
) => {
  const formData = new FormData()
  if (updates?.price !== undefined && updates?.price !== null && updates?.price !== '') {
    formData.append('price', updates.price)
  }
  if (updates?.category !== undefined && updates?.category !== null) {
    formData.append('category', updates.category)
  }
  if (updates?.removedIngredients !== undefined) {
    formData.append('removedIngredients', JSON.stringify(updates.removedIngredients))
  }
  if (updates?.photo) {
    formData.append('photo', updates.photo)
  }

  const response = await fetch(`/api/menus/${restaurantId}/items/${mealId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    let message = fallbackMessage
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch (error) {
      console.error('Menu item update response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

export { addMenuItems, getMenuByRestaurantId, updateMenuItem }
