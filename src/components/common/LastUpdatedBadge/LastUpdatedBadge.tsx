import { useEffect, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import type { DateRange } from '@/components/common/DateRangeFilter/DateRangeFilter'
import { formatLastUpdated } from '@/utils/formatLastUpdated'
import { radius } from '@/theme/tokens'

interface LastUpdatedBadgeProps {
  lastUpdated?: Date
  dateRange: DateRange
}

export function LastUpdatedBadge({
  lastUpdated,
  dateRange,
}: LastUpdatedBadgeProps) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (!lastUpdated) return
    const interval = setInterval(() => forceTick((n) => n + 1), 30_000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  if (!lastUpdated) return null

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        alignItems: 'center',
        flexShrink: 0,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radius.lg}px`,
        pl: 0.5,
        pr: 1.25,
        py: 0.5,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.disabled',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          paddingLeft: 1,
        }}
      >
        {formatLastUpdated(lastUpdated)}
      </Typography>
      <Box
        sx={{ width: '1px', height: 12, backgroundColor: 'text.disabled' }}
      />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          whiteSpace: 'nowrap',
          color: 'secondary.dark',
          pr: 0.5,
        }}
      >
        {dateRange.presetLabel === 'Custom Range' &&
        dateRange.from &&
        dateRange.to
          ? `${dateRange.from} – ${dateRange.to}`
          : dateRange.presetLabel}
      </Typography>
    </Stack>
  )
}
