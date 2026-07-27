import { useEffect, useState } from 'react'
import { Box, Stack, Tooltip, Typography } from '@mui/material'
import { Calendar } from 'lucide-react'
import {
  DateRangeFilter,
  type DateRange,
} from '@/components/common/DateRangeFilter/DateRangeFilter'
import {
  formatLastUpdated,
  formatExactDateTime,
} from '@/utils/formatLastUpdated'
import { radius } from '@/theme/tokens'

const DEFAULT_DATE_RANGE_PRESET = 'Last 30 Days'

interface LastUpdatedBadgeProps {
  lastUpdated?: Date
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export function LastUpdatedBadge({
  lastUpdated,
  dateRange,
  onDateRangeChange,
}: LastUpdatedBadgeProps) {
  const [, forceTick] = useState(0)
  const isDateRangeApplied = dateRange.presetLabel !== DEFAULT_DATE_RANGE_PRESET

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
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radius.lg}px`,
        pl: 0.5,
        pr: 1.25,
        py: 0.5,
      }}
    >
      <DateRangeFilter
        value={dateRange}
        onChange={onDateRangeChange}
        renderTrigger={({ onClick }) => (
          <Tooltip
            title={
              isDateRangeApplied
                ? dateRange.presetLabel
                : 'Date range: Last 30 Days'
            }
          >
            <Stack
              direction="row"
              spacing={0.5}
              onClick={onClick}
              sx={{
                alignItems: 'center',
                color: 'secondary.dark',
                borderRadius: `${radius.sm}px`,
                pl: 0.5,
                pr: isDateRangeApplied ? 1 : 0.5,
                // py: 0.5,
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'secondary.light' },
              }}
            >
              <Calendar size={14} />
              {isDateRangeApplied && (
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  {dateRange.presetLabel === 'Custom Range' &&
                  dateRange.from &&
                  dateRange.to
                    ? `${dateRange.from} – ${dateRange.to}`
                    : dateRange.presetLabel}
                </Typography>
              )}
            </Stack>
          </Tooltip>
        )}
      />
      <Box sx={{ width: '1px', height: 12, backgroundColor: 'divider' }} />
      <Tooltip title={`Last synced ${formatExactDateTime(lastUpdated)}`}>
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {formatLastUpdated(lastUpdated)}
        </Typography>
      </Tooltip>
    </Stack>
  )
}
