import type { ReactNode } from 'react'
import { Stack, Typography } from '@mui/material'

interface DemoLabelProps {
  label: string
  children: ReactNode
}

/** Wraps a single demo instance with a small caption label underneath, for side-by-side variant grids. */
export function DemoLabel({ label, children }: DemoLabelProps) {
  return (
    <Stack spacing={0.75} sx={{ alignItems: 'center' }}>
      {children}
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Stack>
  )
}
