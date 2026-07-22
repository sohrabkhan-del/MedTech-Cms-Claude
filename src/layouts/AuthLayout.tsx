import { Outlet } from 'react-router-dom'
import { Box, Stack, Typography } from '@mui/material'

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        p: 3,
        background: 'linear-gradient(160deg, #F5F7FC 0%, #EDF1FA 45%, #F5F7FC 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,62,140,0.10) 0%, rgba(26,62,140,0) 70%)',
          top: -220,
          right: -180,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,148,29,0.10) 0%, rgba(247,148,29,0) 70%)',
          bottom: -200,
          left: -160,
        }}
      />

      <Stack spacing={3} sx={{ position: 'relative', alignItems: 'center', width: '100%', maxWidth: 420 }}>
        <Box component="img" src="/images/logo/logo.png" alt="MedTech" sx={{ height: 52, width: 'auto' }} />

        <Box sx={{ width: '100%' }}>
          <Outlet />
        </Box>

        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          © {new Date().getFullYear()} MedTech. Caring for life.
        </Typography>
      </Stack>
    </Box>
  )
}
