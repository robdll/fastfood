import { apiUrl } from './api'

const getRestaurants = async (
  token,
  fallbackMessage = 'Unable to load restaurants.'
) => {
  const response = await fetch(apiUrl('/api/restaurants'), {
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
      console.error('Restaurants response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

const getRestaurantById = async (
  id,
  token,
  fallbackMessage = 'Unable to load restaurant.'
) => {
  const response = await fetch(apiUrl(`/api/restaurants/${id}`), {
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
      console.error('Restaurant response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

export { getRestaurantById, getRestaurants }
