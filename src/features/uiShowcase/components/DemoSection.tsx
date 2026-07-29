import type { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'

interface DemoSectionProps {
  title: string
  description?: string
  children: ReactNode
}

/** One labeled sub-block within a component demo page, e.g. "Variants" or "Sizes". */
export function DemoSection({ title, description, children }: DemoSectionProps) {
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</Typography>
        {description && (
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {description}
          </Typography>
        )}
      </Box>
      <Stack
        direction="row"
        sx={{
          flexWrap: 'wrap',
          gap: 2.5,
          alignItems: 'center',
          p: 2.5,
          borderRadius: '10px',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
