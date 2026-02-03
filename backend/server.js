import express from 'express'

const app = express()

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'backend',
    timestamp: new Date().toISOString(),
  })
})

app.get('/', (req, res) => {
  res.type('text').send('Backend is running. Try GET /api/health')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

