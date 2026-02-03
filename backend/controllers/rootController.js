const getRoot = (req, res) => {
  res.type('text').send('Backend is running. Try GET /api/health')
}

export { getRoot }
