import { Card, CardContent, Skeleton, Stack } from '@mui/material'
import { radius } from '@/theme/tokens'

export function StatCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Skeleton variant="text" width="55%" height={16} />
          <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: `${radius.md}px` }} />
        </Stack>
        <Skeleton variant="text" width="45%" height={30} sx={{ mb: 0.5 }} />
        <Skeleton variant="rounded" width="60%" height={20} sx={{ borderRadius: '999px' }} />
      </CardContent>
    </Card>
  )
}
