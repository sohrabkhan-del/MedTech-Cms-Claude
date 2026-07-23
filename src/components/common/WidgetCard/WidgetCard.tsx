import type { ReactNode } from 'react'
import { Box, Card, Divider, MenuItem, Select, Stack, Typography } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { DATE_RANGE_OPTIONS, type DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'

interface WidgetCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  dateRange?: DateRangeValue
  onDateRangeChange?: (value: DateRangeValue) => void
  onCardClick?: () => void
}

export function WidgetCard({
  title,
  subtitle,
  children,
  footer,
  dateRange,
  onDateRangeChange,
  onCardClick,
}: WidgetCardProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onDateRangeChange?.(e.target.value as DateRangeValue)
  }

  return (
    <Card
      onClick={onCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...(onCardClick && {
          cursor: 'pointer',
          transition: 'box-shadow 0.15s ease, transform 0.15s ease',
          '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
        }),
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
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

      <Box sx={{ flexGrow: 1, px: 3, pb: footer ? 1.5 : 2.5, minHeight: 0 }}>{children}</Box>

      {footer && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 1.5 }}>{footer}</Box>
        </>
      )}
    </Card>
  )
}
