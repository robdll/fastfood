import jwt from 'jsonwebtoken'

const getBearerToken = (req) => {
  const header = req.headers?.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim()
}

const requireAuth = (req, res, next) => {
  const token = getBearerToken(req)
  if (!token) {
    res.status(401).json({ error: 'Authorization token is required.' })
    return
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    res.status(500).json({ error: 'JWT secret not configured.' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    req.auth = {
      userId: payload?.userId ?? payload?.sub ?? null,
      email: payload?.email ?? null,
      roles: payload?.roles ?? [],
    }
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

const requireSelf = (req, res, next) => {
  const requestedId = req.params?.id
  if (!req.auth?.userId) {
    res.status(401).json({ error: 'Authorization token is required.' })
    return
  }

  if (requestedId && requestedId !== req.auth.userId) {
    res.status(403).json({ error: 'Forbidden.' })
    return
  }

  next()
}

export { requireAuth, requireSelf }
