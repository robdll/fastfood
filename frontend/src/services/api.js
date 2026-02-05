const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const apiBaseUrl = rawBaseUrl.replace(/\/$/, '')

const apiUrl = (path) => {
  if (!path) return apiBaseUrl
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBaseUrl}${normalizedPath}`
}

export { apiUrl }
