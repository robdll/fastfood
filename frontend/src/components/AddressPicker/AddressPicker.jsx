import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import './AddressPicker.css'

const DEFAULT_CENTER = { lat: 41.9028, lng: 12.4964 }
const DEFAULT_ZOOM = 12
const PICK_ZOOM = 16
const SEARCH_LIMIT = 5

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const markerIconInstance = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const buildSearchUrl = (query, lang) => {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', SEARCH_LIMIT.toString())
  url.searchParams.set('q', query)
  if (lang) url.searchParams.set('accept-language', lang)
  return url.toString()
}

const buildReverseUrl = (lat, lng, lang) => {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', lat.toString())
  url.searchParams.set('lon', lng.toString())
  if (lang) url.searchParams.set('accept-language', lang)
  return url.toString()
}

function Recenter({ position }) {
  const map = useMap()

  useEffect(() => {
    if (!position) return
    map.setView(position, PICK_ZOOM, { animate: true })
  }, [map, position])

  return null
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click: (event) => onPick(event.latlng),
  })
  return null
}

function AddressPicker({ inputId, value, onChange, t, lang }) {
  const [query, setQuery] = useState(value ?? '')
  const [results, setResults] = useState([])
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [reverseError, setReverseError] = useState('')
  const hasGeocodedRef = useRef(false)

  useEffect(() => {
    if (!value || hasGeocodedRef.current) return
    hasGeocodedRef.current = true
    setQuery(value)
    ;(async () => {
      try {
        const response = await fetch(buildSearchUrl(value, lang))
        if (!response.ok) return
        const data = await response.json()
        if (!Array.isArray(data) || data.length === 0) return
        const [first] = data
        setSelectedPosition({
          lat: Number.parseFloat(first.lat),
          lng: Number.parseFloat(first.lon),
        })
      } catch (error) {
        console.error('Unable to geocode initial address', error)
      }
    })()
  }, [value, lang])

  const handleInputChange = (event) => {
    const nextValue = event.target.value
    setQuery(nextValue)
    setResults([])
    setSearchError('')
    setReverseError('')
    onChange?.(nextValue)
  }

  const handleSearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) return
    setIsSearching(true)
    setSearchError('')
    setReverseError('')

    try {
      const response = await fetch(buildSearchUrl(trimmed, lang))
      if (!response.ok) {
        throw new Error('Search failed')
      }
      const data = await response.json()
      if (!Array.isArray(data) || data.length === 0) {
        setResults([])
        setSearchError(t('auth.restaurantAddressNoResults'))
        return
      }
      setResults(data)
    } catch (error) {
      console.error('Unable to search address', error)
      setSearchError(t('auth.restaurantAddressSearchError'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultPick = (result) => {
    if (!result) return
    setResults([])
    setReverseError('')
    setSearchError('')
    setQuery(result.display_name)
    onChange?.(result.display_name)
    setSelectedPosition({
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
    })
  }

  const handleMapPick = async (position) => {
    setSelectedPosition(position)
    setResults([])
    setReverseError('')
    setSearchError('')

    try {
      const response = await fetch(buildReverseUrl(position.lat, position.lng, lang))
      if (!response.ok) {
        throw new Error('Reverse lookup failed')
      }
      const data = await response.json()
      if (!data?.display_name) {
        throw new Error('No address found')
      }
      setQuery(data.display_name)
      onChange?.(data.display_name)
    } catch (error) {
      console.error('Unable to reverse geocode address', error)
      setReverseError(t('auth.restaurantAddressReverseError'))
    }
  }

  const center = selectedPosition ?? DEFAULT_CENTER
  const zoom = selectedPosition ? PICK_ZOOM : DEFAULT_ZOOM

  return (
    <div className="addressPicker">
      <div className="addressPickerInputRow">
        <input
          id={inputId}
          className="input"
          name="restaurantAddress"
          value={query}
          onChange={handleInputChange}
          placeholder={t('auth.restaurantAddressSearchPlaceholder')}
        />
        <button
          type="button"
          className="btn btn--ghost addressPickerButton"
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? t('common.loading') : t('auth.restaurantAddressSearchAction')}
        </button>
      </div>

      {searchError && (
        <span className="tiny errorText" role="status">
          {searchError}
        </span>
      )}

      {results.length > 0 && (
        <ul className="addressPickerResults" role="listbox">
          {results.map((result) => (
            <li key={`${result.place_id}-${result.lat}-${result.lon}`}>
              <button
                className="addressPickerResult"
                type="button"
                onClick={() => handleResultPick(result)}
              >
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {reverseError && (
        <span className="tiny errorText" role="status">
          {reverseError}
        </span>
      )}

      <p className="tiny muted">{t('auth.restaurantAddressMapHint')}</p>

      <div className="addressPickerMap">
        <MapContainer
          className="addressPickerLeaflet"
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={handleMapPick} />
          <Recenter position={selectedPosition} />
          {selectedPosition && (
            <Marker position={selectedPosition} icon={markerIconInstance} />
          )}
        </MapContainer>
      </div>
    </div>
  )
}

export default AddressPicker
