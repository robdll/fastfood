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

export { createUser }
