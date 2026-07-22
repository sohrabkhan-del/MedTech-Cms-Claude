import { Box, Card, Skeleton, Stack } from '@mui/material'

interface WidgetCardSkeletonProps {
  /** Number of placeholder content rows in the body. */
  rows?: number
  /** Body content height when a single block placeholder (e.g. a chart) is more accurate than rows. */
  bodyHeight?: number
}

export function WidgetCardSkeleton({ rows = 4, bodyHeight }: WidgetCardSkeletonProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Skeleton variant="text" width="40%" height={22} />
        <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.25 }} />
      </Stack>

      <Box sx={{ flexGrow: 1, px: 3, pb: 2.5 }}>
        {bodyHeight ? (
          <Skeleton variant="rounded" width="100%" height={bodyHeight} />
        ) : (
          <Stack spacing={2}>
            {Array.from({ length: rows }).map((_, i) => (
              <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Skeleton variant="circular" width={28} height={28} />
                <Stack sx={{ flexGrow: 1 }} spacing={0.5}>
                  <Skeleton variant="text" width="70%" height={16} />
                  <Skeleton variant="text" width="40%" height={12} />
                </Stack>
                <Skeleton variant="text" width={48} height={16} />
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Card>
  )
}
