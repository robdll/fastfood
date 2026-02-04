import { Router } from 'express'
import multer from 'multer'

import { getHealth } from '../controllers/healthController.js'
import { getRoot } from '../controllers/rootController.js'
import { loginUser } from '../controllers/authController.js'
import { requireAuth, requireSelf } from '../middleware/auth.js'
import { createMeal, getMeals } from '../controllers/mealsController.js'
import {
  getRestaurantById,
  getRestaurants,
} from '../controllers/restaurantsController.js'
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
import {
  createOrders,
  getOrders,
  getPreparationCounts,
  updateOrderStatus,
} from '../controllers/ordersController.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get('/api/health', getHealth)
router.get('/', getRoot)
router.post('/api/auth/login', loginUser)
router.get('/api/meals', requireAuth, getMeals)
router.post('/api/meals', requireAuth, upload.any(), createMeal)
router.get('/api/restaurants', requireAuth, getRestaurants)
router.get('/api/restaurants/:id', requireAuth, getRestaurantById)
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
router.post('/api/orders', requireAuth, createOrders)
router.get('/api/orders', requireAuth, getOrders)
router.patch('/api/orders/:id/status', requireAuth, updateOrderStatus)
router.get('/api/orders/preparation-counts', requireAuth, getPreparationCounts)

export default router
