import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { Crosshair, Search, X } from 'lucide-react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { radius } from '@/theme/tokens'

const markerIconDefault = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629] // India

interface GeocodeAddress {
  house_number?: string
  road?: string
  neighbourhood?: string
  suburb?: string
  village?: string
  town?: string
  city?: string
  city_district?: string
  county?: string
  state_district?: string
  state?: string
  postcode?: string
  country?: string
}

interface GeocodeResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type?: string
  address?: GeocodeAddress
}

/** Builds a short, readable place name from the address parts Nominatim returns
 * (falls back to the first segment of display_name if address details are thin). */
function getPrimaryLabel(result: GeocodeResult): string {
  const a = result.address
  const name =
    a?.road || a?.neighbourhood || a?.suburb || a?.village || a?.town || a?.city
  return name || result.display_name.split(',')[0]
}

/** Builds the "district, state, pincode" style secondary line for an Indian address. */
function getSecondaryLabel(result: GeocodeResult): string {
  const a = result.address
  if (!a) return result.display_name
  const parts = [
    a.city_district || a.county || a.state_district,
    a.state,
    a.postcode,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : result.display_name
}

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function RecenterOnChange({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), 14))
  }, [position, map])
  return null
}

interface LocationMapPickerProps {
  latitude?: string
  longitude?: string
  onChange: (latitude: string, longitude: string) => void
  open: boolean
  onClose: () => void
}

/** Modal map picker (Leaflet + OpenStreetMap) for selecting a lat/lng by searching, clicking, or dragging the pin. */
export function LocationMapPicker({
  latitude,
  longitude,
  onChange,
  open,
  onClose,
}: LocationMapPickerProps) {
  const parsedLat = latitude ? Number(latitude) : NaN
  const parsedLng = longitude ? Number(longitude) : NaN
  const initialPosition = useMemo<[number, number] | null>(
    () =>
      Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
        ? [parsedLat, parsedLng]
        : null,
    [parsedLat, parsedLng],
  )

  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition,
  )
  const [manualLatitude, setManualLatitude] = useState(
    initialPosition ? initialPosition[0].toFixed(6) : '',
  )
  const [manualLongitude, setManualLongitude] = useState(
    initialPosition ? initialPosition[1].toFixed(6) : '',
  )
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRequestId = useRef(0)

  useEffect(() => {
    if (!open || initialPosition) return

    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextPosition: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ]
        setPosition(nextPosition)
        setManualLatitude(nextPosition[0].toFixed(6))
        setManualLongitude(nextPosition[1].toFixed(6))
      },
      () => {
        setPosition(DEFAULT_CENTER)
        setManualLatitude(DEFAULT_CENTER[0].toFixed(6))
        setManualLongitude(DEFAULT_CENTER[1].toFixed(6))
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  }, [open, initialPosition])

  // Debounced Nominatim (OpenStreetMap) search-as-you-type
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 3) {
      return
    }

    const thisRequest = ++searchRequestId.current

    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          format: 'jsonv2',
          q: trimmed,
          limit: '15',
          addressdetails: '1',
          countrycodes: 'in',
          'accept-language': 'en',
          dedupe: '0',
          // Soft bias toward Maharashtra (bounded=0 means this nudges ranking,
          // it does not exclude results from elsewhere in India).
          viewbox: '72.6,20.4,73.6,18.7',
          bounded: '0',
        })
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        )
        const data: GeocodeResult[] = await res.json()
        if (searchRequestId.current === thisRequest) {
          setResults(data)
          setShowResults(true)
        }
      } catch (error) {
        console.warn('[LocationMapPicker] geocode search failed', error)
        if (searchRequestId.current === thisRequest) setResults([])
      } finally {
        if (searchRequestId.current === thisRequest) setIsSearching(false)
      }
    }, 400)

    return () => window.clearTimeout(timer)
  }, [query])

  if (!open) return null

  function handlePick(lat: number, lng: number) {
    setPosition([lat, lng])
    setManualLatitude(lat.toFixed(6))
    setManualLongitude(lng.toFixed(6))
  }

  function handleSelectResult(result: GeocodeResult) {
    handlePick(Number(result.lat), Number(result.lon))
    setQuery(result.display_name)
    setShowResults(false)
  }

  function handleClearSearch() {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      handlePick(pos.coords.latitude, pos.coords.longitude)
    })
  }

  function handleManualCoordinateChange(
    value: string,
    type: 'latitude' | 'longitude',
  ) {
    const parsed = Number(value)
    if (type === 'latitude') {
      setManualLatitude(value)
      if (value.trim() === '') {
        setPosition(null)
        return
      }
      if (Number.isFinite(parsed) && parsed >= -90 && parsed <= 90) {
        setPosition((current) => [parsed, current ? current[1] : 78.9629])
      }
      return
    }

    setManualLongitude(value)
    if (value.trim() === '') {
      setPosition(null)
      return
    }
    if (Number.isFinite(parsed) && parsed >= -180 && parsed <= 180) {
      setPosition((current) => [current ? current[0] : 20.5937, parsed])
    }
  }

  function handleConfirm() {
    if (position) {
      onChange(position[0].toFixed(6), position[1].toFixed(6))
    }
    onClose()
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '100%',
          maxWidth: 720,
          backgroundColor: 'background.paper',
          borderRadius: `${radius.lg}px`,
          overflow: 'hidden',
          boxShadow: 24,
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            Pick a location
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close map">
            <X size={18} />
          </IconButton>
        </Stack>

        <Box sx={{ px: 2.5, pt: 2, pb: 1.5, position: 'relative' }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search for a place or address…"
            value={query}
            onChange={(e) => {
              const nextValue = e.target.value
              setQuery(nextValue)
              if (nextValue.trim().length < 3) {
                setResults([])
                setIsSearching(false)
                setShowResults(false)
                return
              }
              setIsSearching(true)
            }}
            onFocus={() => {
              if (results.length > 0) setShowResults(true)
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <Search
                    size={16}
                    style={{ marginRight: 8, flexShrink: 0, opacity: 0.6 }}
                  />
                ),
                endAdornment: isSearching ? (
                  <CircularProgress size={16} sx={{ mr: 0.5 }} />
                ) : query ? (
                  <IconButton size="small" onClick={handleClearSearch}>
                    <X size={14} />
                  </IconButton>
                ) : undefined,
              },
            }}
          />

          {showResults && results.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                left: 20,
                right: 20,
                top: '100%',
                mt: 0.5,
                zIndex: 1400,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: `${radius.md}px`,
                boxShadow: 6,
                maxHeight: 320,
                overflowY: 'auto',
              }}
            >
              <List dense disablePadding>
                {results.map((result) => (
                  <ListItemButton
                    key={result.place_id}
                    onClick={() => handleSelectResult(result)}
                  >
                    <ListItemText
                      primary={getPrimaryLabel(result)}
                      secondary={getSecondaryLabel(result)}
                      slotProps={{
                        primary: {
                          sx: { fontSize: '0.8125rem', fontWeight: 600 },
                        },
                        secondary: { sx: { fontSize: '0.75rem' } },
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          )}

          {showResults &&
            !isSearching &&
            query.trim().length >= 3 &&
            results.length === 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 20,
                  right: 20,
                  top: '100%',
                  mt: 0.5,
                  zIndex: 1400,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: `${radius.md}px`,
                  boxShadow: 6,
                  p: 1.5,
                  fontSize: '0.8125rem',
                  color: 'text.secondary',
                }}
              >
                No matches for "{query}"
              </Box>
            )}
        </Box>

        <Box sx={{ height: 340, position: 'relative' }}>
          <MapContainer
            center={position ?? DEFAULT_CENTER}
            zoom={position ? 14 : 5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler
              onPick={(lat, lng) => {
                handlePick(lat, lng)
                setShowResults(false)
              }}
            />
            <RecenterOnChange position={position} />
            {position && (
              <Marker
                position={position}
                icon={markerIconDefault}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target as L.Marker
                    const { lat, lng } = marker.getLatLng()
                    handlePick(lat, lng)
                  },
                }}
              />
            )}
          </MapContainer>
          <Tooltip title="Use my current location">
            <IconButton
              size="small"
              onClick={handleUseCurrentLocation}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 1000,
                backgroundColor: 'background.paper',
                boxShadow: 2,
                '&:hover': { backgroundColor: 'background.paper' },
              }}
            >
              <Crosshair size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          sx={{ p: 2.5, alignItems: 'center' }}
        >
          <TextField
            label="Latitude"
            size="small"
            value={manualLatitude}
            onChange={(e) =>
              handleManualCoordinateChange(e.target.value, 'latitude')
            }
            fullWidth
          />
          <TextField
            label="Longitude"
            size="small"
            value={manualLongitude}
            onChange={(e) =>
              handleManualCoordinateChange(e.target.value, 'longitude')
            }
            fullWidth
          />
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ px: 2.5, pb: 2.5, justifyContent: 'flex-end' }}
        >
          <Box
            component="button"
            type="button"
            onClick={onClose}
            sx={{
              px: 2,
              py: 1,
              borderRadius: `${radius.md}px`,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'transparent',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            type="button"
            onClick={handleConfirm}
            disabled={!position}
            sx={{
              px: 2,
              py: 1,
              borderRadius: `${radius.md}px`,
              border: 'none',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: position ? 'pointer' : 'default',
              opacity: position ? 1 : 0.5,
            }}
          >
            Use this location
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
