import express from 'express'
import { fileURLToPath } from 'node:url'

import divinationRoutes from './routes/divination.js'

const app = express()
app.use(express.json({ limit: '32kb' }))
app.get('/healthz', (_req, res) => res.json({ ok: true }))
app.use('/api/divination', divinationRoutes)
app.use((error, _req, res, next) => {
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: '请求体必须是有效 JSON' })
  }
  next(error)
})

const port = Number(process.env.PORT || 3001)
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  app.listen(port, () => {
    console.log(`Liuyao calendar service listening on http://localhost:${port}`)
  })
}

export default app
