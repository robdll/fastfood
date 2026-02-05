const SEARCH_LIMIT = 5
const DEFAULT_TIMEOUT_MS = 6000

const buildSearchUrl = (query, lang) => {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', SEARCH_LIMIT.toString())
  url.searchParams.set('q', query)
  if (lang) url.searchParams.set('accept-language', lang)
  return url.toString()
}

const geocodeAddress = async (address, lang) => {
  const trimmed = address?.toString().trim()
  if (!trimmed) throw new Error('Address is required')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(buildSearchUrl(trimmed, lang), {
      headers: { 'User-Agent': 'fastfood-app' },
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error('Geocoding failed')
    }
    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No geocoding results')
    }
    return {
      lat: Number.parseFloat(data[0].lat),
      lng: Number.parseFloat(data[0].lon),
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

const haversineKm = (from, to) => {
  const radius = 6371
  const toRadians = (value) => (value * Math.PI) / 180
  const deltaLat = toRadians(to.lat - from.lat)
  const deltaLng = toRadians(to.lng - from.lng)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return radius * c
}

const estimateDelivery = async ({
  restaurantAddress,
  deliveryAddress,
  preparationCount = 0,
  lang,
}) => {
  const [restaurantCoords, deliveryCoords] = await Promise.all([
    geocodeAddress(restaurantAddress, lang),
    geocodeAddress(deliveryAddress, lang),
  ])
  const distanceKm = haversineKm(restaurantCoords, deliveryCoords)
  const roundedKm = Math.ceil(distanceKm)
  const fee = Math.max(1, roundedKm * 0.5)
  const baseMinutes = 30 + roundedKm * 1.5
  const extraMinutes = preparationCount * 5
  const minutes = baseMinutes + extraMinutes
  return { fee, minutes }
}

export { estimateDelivery }
