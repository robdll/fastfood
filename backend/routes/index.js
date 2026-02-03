import { Router } from 'express'

import { getHealth } from '../controllers/healthController.js'
import { getRoot } from '../controllers/rootController.js'

const router = Router()

router.get('/api/health', getHealth)
router.get('/', getRoot)

export default router
