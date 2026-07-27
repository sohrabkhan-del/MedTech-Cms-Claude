import type { ReactNode } from 'react'
import { Box, Card, Divider, Stack, Typography } from '@mui/material'
import { DateRangeDropdown } from '@/components/common/DateRangeDropdown/DateRangeDropdown'
import { DATE_RANGE_OPTIONS, type DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'

interface WidgetCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  dateRange?: DateRangeValue
  onDateRangeChange?: (value: DateRangeValue) => void
  /** Custom header action, rendered instead of the built-in date-range select. */
  headerAction?: ReactNode
  onCardClick?: () => void
}

export function WidgetCard({
  title,
  subtitle,
  children,
  footer,
  dateRange,
  onDateRangeChange,
  headerAction,
  onCardClick,
}: WidgetCardProps) {
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
        {headerAction}
        {!headerAction && dateRange && onDateRangeChange && (
          <DateRangeDropdown
            value={dateRange}
            onChange={onDateRangeChange}
            options={DATE_RANGE_OPTIONS}
            aria-label={`${title} date range`}
          />
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
