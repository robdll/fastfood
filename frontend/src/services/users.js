const createUser = async (payload, fallbackMessage = 'Unable to create account.') => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = fallbackMessage
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch (error) {
      console.error('Signup response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

const getUserById = async (
  id,
  token,
  fallbackMessage = 'Unable to load user profile.'
) => {
  const response = await fetch(`/api/users/${id}`, {
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
      console.error('User fetch response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

const updateUser = async (
  id,
  token,
  payload,
  fallbackMessage = 'Unable to update account.'
) => {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = fallbackMessage
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch (error) {
      console.error('User update response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

export { createUser, getUserById, updateUser }
