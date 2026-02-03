const loginUser = async (payload, fallbackMessage = 'Unable to sign in.') => {
  const response = await fetch('/api/auth/login', {
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
      console.error('Login response error parsing failed', error)
    }
    throw new Error(message)
  }

  return response.json()
}

export { loginUser }
