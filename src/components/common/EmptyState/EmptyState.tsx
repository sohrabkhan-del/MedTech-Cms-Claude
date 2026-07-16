import type { ReactNode } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { Inbox } from 'lucide-react'
import { radius } from '@/theme/tokens'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', py: 8, px: 3, textAlign: 'center' }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: `${radius.lg}px`,
          backgroundColor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
        }}
      >
        {icon ?? <Inbox size={28} />}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'text.primary' }}>{title}</Typography>
        {description && (
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 320 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  )
}
