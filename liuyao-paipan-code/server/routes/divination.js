import express from 'express'

import { getContext } from '../controllers/divinationController.js'

const router = express.Router()

function requireApiKey(req, res, next) {
  const expectedKey = process.env.DIVINATION_API_KEY
  if (!expectedKey) {
    // No key configured (e.g. local/dev/test environments): skip enforcement.
    return next()
  }
  if (req.get('x-api-key') !== expectedKey) {
    return res.status(401).json({ success: false, message: '未授权的请求' })
  }
  next()
}

router.post('/context', requireApiKey, getContext)

export default router
