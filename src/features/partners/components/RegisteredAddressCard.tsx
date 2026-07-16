import { Box, Card, Chip, Stack, Typography } from '@mui/material'
import { MapPin, ExternalLink } from 'lucide-react'
import type { GeoLockDetails } from '@/types/partner'

interface RegisteredAddressCardProps {
  address: string
  geoLock: GeoLockDetails
}

export function RegisteredAddressCard({ address, geoLock }: RegisteredAddressCardProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${geoLock.latitude},${geoLock.longitude}`

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>Registered Shop Address</Typography>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <Box component="span" sx={{ color: 'text.secondary', mt: 0.25, display: 'inline-flex' }}>
          <MapPin size={20} />
        </Box>
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {address}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        <Chip
          label={geoLock.active ? 'Geo-fence Active' : 'Geo-fence Inactive'}
          color={geoLock.active ? 'success' : 'error'}
          size="small"
        />
        <Chip
          label={`Buffer Radius: ${geoLock.bufferRadiusMeters}m`}
          variant="outlined"
          size="small"
          sx={{ borderColor: 'divider', color: 'text.secondary' }}
        />
      </Stack>

      <Typography
        component="a"
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        Open in Google Maps
        <ExternalLink size={14} />
      </Typography>
    </Card>
  )
}
