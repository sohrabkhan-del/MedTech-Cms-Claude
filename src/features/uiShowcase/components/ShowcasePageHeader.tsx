import type { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'

interface ShowcasePageHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}

/** Matches the icon-chip + title + subtitle header pattern used by pages that don't opt into the RegionTopbar (e.g. ProfileSettingsPage). */
export function ShowcasePageHeader({ icon, title, subtitle, action }: ShowcasePageHeaderProps) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5, flexWrap: 'wrap' }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.light',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h1">{title}</Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {action}
    </Stack>
  )
}
