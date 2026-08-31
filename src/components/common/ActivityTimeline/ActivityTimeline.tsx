import { Box, Stack, Typography, Skeleton } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'

export interface ActivityTimelineEntry {
  id: string
  activity: string
  dateTime: string
}

interface ActivityTimelineProps {
  entries: ActivityTimelineEntry[]
  emptyTitle?: string
  loading?: boolean
}

export function ActivityTimeline({
  entries,
  emptyTitle = 'No activity yet',
  loading = false,
}: ActivityTimelineProps) {
  if (loading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Stack
            key={i}
            direction="row"
            spacing={2}
            sx={{ alignItems: 'flex-start' }}
          >
            <Stack sx={{ alignItems: 'center' }}>
              <Skeleton variant="circular" width={8} height={8} />
              <Box sx={{ width: '1px', flexGrow: 1, minHeight: 24 }} />
            </Stack>
            <Box sx={{ pb: 2.5, width: '100%' }}>
              <Skeleton width="60%" height={18} sx={{ mb: 0.5 }} />
              <Skeleton width="40%" height={12} />
            </Box>
          </Stack>
        ))}
      </Stack>
    )
  }

  if (entries.length === 0) {
    return <EmptyState title={emptyTitle} />
  }

  return (
    <Stack spacing={0}>
      {entries.map((entry, index) => (
        <Stack
          key={entry.id}
          direction="row"
          spacing={2}
          sx={{ alignItems: 'flex-start' }}
        >
          <Stack sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                mt: 0.75,
              }}
            />
            {index < entries.length - 1 && (
              <Box
                sx={{
                  width: '1px',
                  flexGrow: 1,
                  minHeight: 24,
                  backgroundColor: 'divider',
                }}
              />
            )}
          </Stack>
          <Box sx={{ pb: 2.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {entry.activity}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {entry.dateTime}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  )
}
