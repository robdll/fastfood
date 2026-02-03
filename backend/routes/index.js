import { Router } from 'express'

import { getHealth } from '../controllers/healthController.js'
import { getRoot } from '../controllers/rootController.js'
import { loginUser } from '../controllers/authController.js'
import { requireAuth, requireSelf } from '../middleware/auth.js'
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from '../controllers/usersController.js'

const router = Router()

router.get('/api/health', getHealth)
router.get('/', getRoot)
router.post('/api/auth/login', loginUser)
router.get('/api/users/:id', requireAuth, requireSelf, getUserById)
router.post('/api/users', createUser)
router.put('/api/users/:id', requireAuth, requireSelf, updateUser)
router.delete('/api/users/:id', requireAuth, requireSelf, deleteUser)

export default router
