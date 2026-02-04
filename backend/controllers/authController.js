import jwt from 'jsonwebtoken'

import { connectToDatabase } from '../db/db.js'
import { isPlainObject } from '../utils/utils.js'

const COLLECTION_NAME = 'users'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const loginUser = async (req, res) => {
  const payload = req.body

  if (!isPlainObject(payload)) {
    res.status(400).json({ error: 'Login payload is required.' })
    return
  }

  const email = payload.email?.toString().trim()
  const password = payload.password?.toString()

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' })
    return
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    res.status(500).json({ error: 'JWT secret not configured.' })
    return
  }

  const { client, db } = await connectToDatabase()

  try {
    const user = await db.collection(COLLECTION_NAME).findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' },
      active: { $ne: false },
    })

    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Invalid credentials.' })
      return
    }

    const { password: _password, ...safeUser } = user
    const token = jwt.sign(
      {
        sub: user._id?.toString(),
        userId: user._id?.toString(),
        email: user.email,
        roles: user.roles ?? [],
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' },
    )

    res.json({ user: safeUser, token })
  } finally {
    await client.close()
  }
}

export { loginUser }
