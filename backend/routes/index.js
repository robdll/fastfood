import { Router } from 'express'
import multer from 'multer'

import { getHealth } from '../controllers/healthController.js'
import { getRoot } from '../controllers/rootController.js'
import { loginUser } from '../controllers/authController.js'
import { requireAuth, requireSelf } from '../middleware/auth.js'
import { createMeal, getMeals } from '../controllers/mealsController.js'
import {
  addMenuItems,
  deleteMenuItem,
  getMenuByRestaurantId,
  updateMenuItem,
} from '../controllers/menusController.js'
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from '../controllers/usersController.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/api/health', getHealth)
router.get('/', getRoot)
router.post('/api/auth/login', loginUser)
router.get('/api/meals', requireAuth, getMeals)
router.post('/api/meals', requireAuth, upload.any(), createMeal)
router.get('/api/users/:id', requireAuth, requireSelf, getUserById)
router.get('/api/menus/:restaurantId', requireAuth, getMenuByRestaurantId)
router.patch(
  '/api/menus/:restaurantId/items',
  requireAuth,
  upload.any(),
  addMenuItems
)
router.patch(
  '/api/menus/:restaurantId/items/:mealId',
  requireAuth,
  upload.any(),
  updateMenuItem
)
router.delete(
  '/api/menus/:restaurantId/items/:mealId',
  requireAuth,
  deleteMenuItem
)
router.post('/api/users', createUser)
router.put('/api/users/:id', requireAuth, requireSelf, updateUser)
router.delete('/api/users/:id', requireAuth, requireSelf, deleteUser)

export default router
