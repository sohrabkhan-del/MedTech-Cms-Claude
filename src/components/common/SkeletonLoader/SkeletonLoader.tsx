import {
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

interface SkeletonLoaderProps {
  variant?: 'table-rows' | 'card' | 'text-block'
  rows?: number
  /** Number of shimmer columns to show for the `table-rows` variant. */
  columns?: number
}

/** Widths cycled across columns so the shimmer looks organic rather than uniform. */
const CELL_WIDTHS = ['65%', '80%', '45%', '55%', '70%', '50%']

export function SkeletonLoader({
  variant = 'text-block',
  rows = 5,
  columns = 6,
}: SkeletonLoaderProps) {
  if (variant === 'table-rows') {
    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, c) => (
                <TableCell key={c} sx={{ py: 1.25 }}>
                  <Skeleton
                    variant="text"
                    width={CELL_WIDTHS[c % CELL_WIDTHS.length]}
                    height={16}
                    sx={{ borderRadius: '4px' }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, r) => (
              <TableRow key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <TableCell key={c} sx={{ py: 1.5 }}>
                    <Skeleton
                      variant="rounded"
                      width={CELL_WIDTHS[(r + c) % CELL_WIDTHS.length]}
                      height={14}
                      sx={{ borderRadius: '4px' }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
        <Skeleton
          key={i}
          variant="text"
          height={20}
          width={i === rows - 1 ? '60%' : '100%'}
        />
      ))}
    </Stack>
  )
}
