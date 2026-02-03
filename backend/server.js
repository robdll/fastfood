import express from 'express'
import router from './routes/index.js'

const app = express()

app.use(router)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

