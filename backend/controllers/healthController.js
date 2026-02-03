const getHealth = (req, res) => {
  res.json({
    ok: true,
    service: 'backend',
    timestamp: new Date().toISOString(),
  })
}

export { getHealth }
