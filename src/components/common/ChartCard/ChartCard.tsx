import type { ReactNode } from 'react'
import { Box, Card, MenuItem, Select, Stack, Typography } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { DATE_RANGE_OPTIONS, type DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  height?: number
  dateRange?: DateRangeValue
  onDateRangeChange?: (value: DateRangeValue) => void
  onCardClick?: () => void
}

export function ChartCard({
  title,
  subtitle,
  children,
  height = 320,
  dateRange,
  onDateRangeChange,
  onCardClick,
}: ChartCardProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onDateRangeChange?.(e.target.value as DateRangeValue)
  }

  return (
    <Card
      onClick={onCardClick}
      sx={{
        height: '100%',
        ...(onCardClick && {
          cursor: 'pointer',
          transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
        }),
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', p: 3, pb: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{title}</Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {dateRange && onDateRangeChange && (
          <Select
            size="small"
            value={dateRange}
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
            aria-label={`${title} date range`}
            sx={{ minWidth: 120 }}
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )}
      </Stack>
      <Box sx={{ px: 2, pb: 2, height }}>{children}</Box>
    </Card>
  )
}
