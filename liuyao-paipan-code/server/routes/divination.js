import express from 'express'

import { getContext } from '../controllers/divinationController.js'

const router = express.Router()

router.post('/context', getContext)

export default router
