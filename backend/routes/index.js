import { Router } from 'express'

import { getHealth } from '../controllers/healthController.js'
import { getRoot } from '../controllers/rootController.js'
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from '../controllers/usersController.js'

const router = Router()

router.get('/api/health', getHealth)
router.get('/', getRoot)
router.get('/api/users/:id', getUserById)
router.post('/api/users', createUser)
router.put('/api/users/:id', updateUser)
router.delete('/api/users/:id', deleteUser)

export default router
