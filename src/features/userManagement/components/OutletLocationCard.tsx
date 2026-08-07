import { alpha, Box, Button, Chip, Stack, Typography } from '@mui/material'
import { ExternalLink, MapPinned } from 'lucide-react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import type { PartnerBusinessDetail } from '@/types/partner'

const markerIconDefault = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface OutletLocationCardProps {
  business: PartnerBusinessDetail
  index: number
}

function formatCoordinate(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return value.toFixed(6)
}

export function OutletLocationCard({
  business,
  index,
}: OutletLocationCardProps) {
  const hasCoordinates =
    typeof business.latitude === 'number' &&
    typeof business.longitude === 'number'

  const position: [number, number] | null = hasCoordinates
    ? [business.latitude!, business.longitude!]
    : null

  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
    : undefined

  const addressLine = [business.addressLine1, business.addressLine2]
    .filter(Boolean)
    .join(', ')

  return (
    <Box
      sx={(theme) => ({
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.06,
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      })}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        sx={{ p: 2.5, alignItems: { md: 'stretch' } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', mb: 1.25 }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <MapPinned size={18} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {business.outletName || `Outlet ${index + 1}`}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Outlet location & coordinates
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 1.25 }}
          >
            {addressLine ||
              `${business.city || 'City'}, ${business.state || 'State'}`}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1.5 }}>
            {business.city && (
              <Chip label={business.city} size="small" variant="outlined" />
            )}
            {business.state && (
              <Chip label={business.state} size="small" variant="outlined" />
            )}
            {business.pincode && (
              <Chip label={business.pincode} size="small" variant="outlined" />
            )}
          </Stack>

          {hasCoordinates ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ mb: 1.5 }}
            >
              <Chip
                label={`Lat: ${formatCoordinate(business.latitude)}`}
                size="small"
                color="primary"
              />
              <Chip
                label={`Lng: ${formatCoordinate(business.longitude)}`}
                size="small"
                color="secondary"
              />
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 1.5 }}
            >
              Location coordinates are not available for this outlet yet.
            </Typography>
          )}

          {mapUrl && (
            <Button
              component="a"
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              size="small"
              endIcon={<ExternalLink size={16} />}
              sx={{
                alignSelf: 'flex-start',
                borderRadius: 999,
                px: 1.25,
                textTransform: 'none',
              }}
            >
              Open in Maps
            </Button>
          )}
        </Box>

        <Box
          sx={{
            width: { xs: '100%', md: 260 },
            height: 220,
            borderRadius: 2.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.100',
          }}
        >
          {hasCoordinates && position ? (
            <MapContainer
              center={position}
              zoom={14}
              scrollWheelZoom={false}
              zoomControl={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} icon={markerIconDefault} />
            </MapContainer>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                Map preview unavailable until coordinates are captured.
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
