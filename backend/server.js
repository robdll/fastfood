import dotenv from 'dotenv'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import router from './routes/index.js'
import swaggerSpec from './swagger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '.env') })

const app = express()

app.use(express.json())
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use(router)

app.use((err, req, res, next) => {
  console.error('Unhandled error', err)
  res.status(500).json({ error: err?.message || 'Internal server error.' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

