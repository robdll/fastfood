const TOKEN_KEY = 'jwt'

const getJwt = () => window.localStorage.getItem(TOKEN_KEY)
const setJwt = (token) => window.localStorage.setItem(TOKEN_KEY, token)
const clearJwt = () => window.localStorage.removeItem(TOKEN_KEY)

const decodeBase64Url = (value) => {
  if (!value) return null
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '='
  )
  try {
    return window.atob(padded)
  } catch (error) {
    console.error('Unable to decode JWT payload.', error)
    return null
  }
}

const getJwtPayload = (token) => {
  const raw = token || getJwt()
  if (!raw) return null
  const [, payload] = raw.split('.')
  if (!payload) return null
  const decoded = decodeBase64Url(payload)
  if (!decoded) return null
  try {
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Unable to parse JWT payload.', error)
    return null
  }
}

const getUserIdFromJwt = (token) => {
  const payload = getJwtPayload(token)
  return payload?.userId ?? payload?.sub ?? null
}

export { TOKEN_KEY, getJwt, setJwt, clearJwt, getJwtPayload, getUserIdFromJwt }
