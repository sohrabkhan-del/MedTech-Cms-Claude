import { Skeleton, Stack } from '@mui/material'

interface SkeletonLoaderProps {
  variant?: 'table-rows' | 'card' | 'text-block'
  rows?: number
}

export function SkeletonLoader({ variant = 'text-block', rows = 5 }: SkeletonLoaderProps) {
  if (variant === 'table-rows') {
    return (
      <Stack spacing={1.5} sx={{ p: 2 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: '8px' }} />
        ))}
      </Stack>
    )
  }

  if (variant === 'card') {
    return (
      <Stack spacing={1.5} sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: '12px' }} />
      </Stack>
    )
  }

  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="text" height={20} width={i === rows - 1 ? '60%' : '100%'} />
      ))}
    </Stack>
  )
}
