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

export { getMeals }
