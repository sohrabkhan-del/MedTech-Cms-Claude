import { Outlet } from 'react-router-dom'
import { Box, Stack, Typography } from '@mui/material'
import { Stethoscope } from 'lucide-react'

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Stack spacing={3} sx={{ alignItems: 'center', width: '100%', maxWidth: 420 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', color: 'secondary.main' }}>
          <Stethoscope size={36} />
          <Box>
            <Typography variant="h2">MedTech</Typography>
            <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600 }}>
              Caring for life
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ width: '100%' }}>
          <Outlet />
        </Box>
      </Stack>
    </Box>
  )
}
