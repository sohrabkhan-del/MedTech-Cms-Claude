import { Box, Card, Grid, Stack, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import type { GeoLockDetails } from '@/types/partner'

interface GeoLockCardProps {
  geoLock: GeoLockDetails
}

export function GeoLockCard({ geoLock }: GeoLockCardProps) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>Geo-Lock Details</Typography>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          mb: 2.5,
          p: 1.5,
          borderRadius: '10px',
          backgroundColor: geoLock.active ? 'success.light' : 'error.light',
        }}
      >
        <Box sx={{ color: geoLock.active ? 'success.main' : 'error.main', display: 'flex' }}>
          {geoLock.active ? <LockOutlinedIcon /> : <LockOpenOutlinedIcon />}
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: geoLock.active ? 'success.main' : 'error.main' }}>
          Geo-lock is currently {geoLock.active ? 'active' : 'inactive'}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={6}>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Latitude
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{geoLock.latitude.toFixed(5)}</Typography>
        </Grid>
        <Grid size={6}>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Longitude
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{geoLock.longitude.toFixed(5)}</Typography>
        </Grid>
        <Grid size={6}>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Allowed Radius
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{geoLock.allowedRadiusMeters}m</Typography>
        </Grid>
        <Grid size={6}>
          <Typography variant="caption" sx={{ display: 'block' }}>
            Last Verified
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{geoLock.lastVerifiedDate}</Typography>
        </Grid>
      </Grid>
    </Card>
  )
}
