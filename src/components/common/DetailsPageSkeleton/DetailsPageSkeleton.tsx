import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material'

interface DetailsPageSkeletonProps {
  /** Number of secondary content cards below the header (address, stats, history, etc). */
  sections?: number
}

/** Mirrors the icon + title header and stacked-card layout shared by every details page. */
export function DetailsPageSkeleton({ sections = 3 }: DetailsPageSkeletonProps) {
  return (
    <Stack spacing={0}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '10px' }} />
        <Box>
          <Skeleton variant="text" width={220} height={28} />
          <Skeleton variant="text" width={140} height={18} />
        </Box>
      </Stack>

      <Stack spacing={3}>
        {Array.from({ length: sections }).map((_, i) => (
          <Card key={i}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width="25%" height={22} sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={44} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" height={44} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" height={44} width="70%" sx={{ borderRadius: '8px' }} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}
