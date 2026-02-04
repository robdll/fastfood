const createOrders = async (
  orders,
  token,
  fallbackMessage = 'Unable to place the order.'
) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orders }),
  })

  if (!response.ok) {
    let message = fallbackMessage
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch (error) {
      console.error('Orders response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

const getPreparationCounts = async (
  restaurantIds,
  token,
  fallbackMessage = 'Unable to load preparation counts.'
) => {
  const ids = Array.isArray(restaurantIds) ? restaurantIds.filter(Boolean) : []
  const query = ids.length > 0 ? `?restaurantIds=${ids.join(',')}` : ''
  const response = await fetch(`/api/orders/preparation-counts${query}`, {
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
      console.error('Preparation counts response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

export { createOrders, getPreparationCounts }
