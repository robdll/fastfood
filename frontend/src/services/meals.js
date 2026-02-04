const getMeals = async (token, fallbackMessage = 'Unable to load meals.') => {
  const response = await fetch('/api/meals', {
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
      console.error('Meals response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

const createMeal = async (
  token,
  payload,
  fallbackMessage = 'Unable to create meal.'
) => {
  const formData = new FormData()
  formData.append('name', payload?.name ?? '')
  formData.append('category', payload?.category ?? '')
  formData.append('origin', payload?.origin ?? '')
  formData.append('ingredients', JSON.stringify(payload?.ingredients ?? []))
  if (payload?.photo) {
    formData.append('photo', payload.photo)
  }

  const response = await fetch('/api/meals', {
    method: 'POST',
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
      console.error('Meal create response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

export { createMeal, getMeals }
