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
  const payloadItems = items.map(({ mealId, price }) => ({ mealId, price }))
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

export { addMenuItems, getMenuByRestaurantId }
