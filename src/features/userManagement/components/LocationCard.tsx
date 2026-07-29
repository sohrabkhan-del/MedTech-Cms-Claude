import { Box, Card, Chip, Stack, Typography } from '@mui/material'
import { MapPin, ExternalLink, Lock, LockOpen } from 'lucide-react'
import type { GeoLockDetails } from '@/types/partner'

interface LocationCardProps {
  title?: string
  address: string
  geoLock: GeoLockDetails
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 96 }}>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{value}</Typography>
    </Box>
  )
}

export function LocationCard({
  title = 'Registered Shop Address',
  address,
  geoLock,
}: LocationCardProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${geoLock.latitude},${geoLock.longitude}`

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        sx={{ alignItems: { md: 'center' } }}
      >
        <Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 0.75 }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Box
              component="span"
              sx={{ color: 'text.secondary', mt: 0.25, display: 'inline-flex', flexShrink: 0 }}
            >
              <MapPin size={16} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" sx={{ color: 'text.primary', fontSize: '0.8125rem' }}>
                {address}
              </Typography>
              <Typography
                component="a"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Open in Google Maps
                <ExternalLink size={12} />
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            px: 1.5,
            py: 1,
            borderRadius: '10px',
            backgroundColor: geoLock.active ? 'success.light' : 'error.light',
            flexShrink: 0,
          }}
        >
          <Box sx={{ color: geoLock.active ? 'success.main' : 'error.main', display: 'flex' }}>
            {geoLock.active ? <Lock size={16} /> : <LockOpen size={16} />}
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              color: geoLock.active ? 'success.main' : 'error.main',
              whiteSpace: 'nowrap',
            }}
          >
            Geo-lock {geoLock.active ? 'active' : 'inactive'}
          </Typography>
          <Chip
            label={`Buffer: ${geoLock.bufferRadiusMeters}m`}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider', color: 'text.secondary' }}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={3}
          sx={{ flexWrap: 'wrap', rowGap: 1.5, flexShrink: 0 }}
        >
          <Stat label="Latitude" value={geoLock.latitude.toFixed(5)} />
          <Stat label="Longitude" value={geoLock.longitude.toFixed(5)} />
          <Stat label="Allowed Radius" value={`${geoLock.allowedRadiusMeters}m`} />
          <Stat label="Last Verified" value={geoLock.lastVerifiedDate} />
        </Stack>
      </Stack>
    </Card>
  )
}
