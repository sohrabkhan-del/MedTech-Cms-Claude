import { useEffect, useState } from 'react'
import { Box, IconButton, Stack, TextField, Tooltip } from '@mui/material'
import { Crosshair, X } from 'lucide-react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
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

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
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

/** Modal map picker (Leaflet + OpenStreetMap) for selecting a lat/lng by clicking or dragging the pin. */
export function LocationMapPicker({
  latitude,
  longitude,
  onChange,
  open,
  onClose,
}: LocationMapPickerProps) {
  const parsedLat = latitude ? Number(latitude) : NaN
  const parsedLng = longitude ? Number(longitude) : NaN
  const initialPosition: [number, number] | null =
    Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
      ? [parsedLat, parsedLng]
      : null

  const [position, setPosition] = useState<[number, number] | null>(initialPosition)

  useEffect(() => {
    if (open) setPosition(initialPosition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  function handlePick(lat: number, lng: number) {
    setPosition([lat, lng])
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      handlePick(pos.coords.latitude, pos.coords.longitude)
    })
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
          <Box sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>Pick a location</Box>
          <IconButton size="small" onClick={onClose} aria-label="Close map">
            <X size={18} />
          </IconButton>
        </Stack>

        <Box sx={{ height: 360, position: 'relative' }}>
          <MapContainer
            center={position ?? DEFAULT_CENTER}
            zoom={position ? 14 : 5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onPick={handlePick} />
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

        <Stack direction="row" spacing={2} sx={{ p: 2.5, alignItems: 'center' }}>
          <TextField
            label="Latitude"
            size="small"
            value={position ? position[0].toFixed(6) : ''}
            slotProps={{ input: { readOnly: true } }}
            fullWidth
          />
          <TextField
            label="Longitude"
            size="small"
            value={position ? position[1].toFixed(6) : ''}
            slotProps={{ input: { readOnly: true } }}
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
