import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Box, Button, Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { NoData } from '@/components/common/NoData/NoData'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { DateRangeDropdown } from '@/components/common/DateRangeDropdown/DateRangeDropdown'
import {
  SCAN_DATE_RANGE_OPTIONS,
  type ScanDateRangeValue,
} from '@/components/common/DateRangeSelect/DateRangeSelect'
import type { RecentScan } from '@/features/dashboard/types/dashboard.types'

const MAX_VISIBLE_SCANS = 10

interface RecentScansWidgetProps {
  recentScans: RecentScan[]
  dateRange: ScanDateRangeValue
  onDateRangeChange: (value: ScanDateRangeValue) => void
}

export function RecentScansWidget({
  recentScans,
  dateRange,
  onDateRangeChange,
}: RecentScansWidgetProps) {
  const navigate = useNavigate()

  const visibleScans = useMemo(
    () => recentScans.slice(0, MAX_VISIBLE_SCANS),
    [recentScans],
  )

  if (!recentScans || recentScans.length === 0) {
    return (
      <WidgetCard
        title="Recent Scans"
        subtitle="Live scan feed across regions"
        onCardClick={() => navigate('/reports/scan-reports')}
        headerAction={
          <DateRangeDropdown
            value={dateRange}
            onChange={onDateRangeChange}
            options={SCAN_DATE_RANGE_OPTIONS}
            aria-label="Recent Scans date range"
            minWidth={84}
          />
        }
        footer={
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              navigate('/field-operations/live-scan-feed')
            }}
          >
            View All
          </Button>
        }
      >
        <NoData height={280} />
      </WidgetCard>
    )
  }

  return (
    <WidgetCard
      title="Recent Scans"
      subtitle="Live scan feed across regions"
      onCardClick={() => navigate('/reports/scan-reports')}
      headerAction={
        <DateRangeDropdown
          value={dateRange}
          onChange={onDateRangeChange}
          options={SCAN_DATE_RANGE_OPTIONS}
          aria-label="Recent Scans date range"
          minWidth={84}
        />
      }
      footer={
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            navigate('/field-operations/live-scan-feed')
          }}
        >
          View All
        </Button>
      }
    >
      <Box
        sx={{
          height: 380,
          minHeight: 280,
          overflowY: 'auto',
          mr: -1.5,
          pr: 1.5,
        }}
      >
        <Stack spacing={2}>
          {visibleScans.map((scan) => (
            <Stack
              key={scan.id}
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
                cursor: scan.linkTo ? 'Pointer' : 'default',
                p: 1,
                m: -1,
                borderRadius: 1.5,
                border: '1px solid transparent',
                transition:
                  'border-color 0.15s ease, background-color 0.15s ease',
                ...(scan.linkTo && {
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }),
              }}
              onClick={(e) => {
                if (!scan.linkTo) return
                e.stopPropagation()
                navigate(scan.linkTo)
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {scan.user.slice(0, 1)}
              </Avatar>
              <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  noWrap
                >
                  {scan.business}
                </Typography>
                <Typography variant="caption" noWrap>
                  {scan.user} · {scan.role} · {scan.region}
                </Typography>
              </Stack>
              <Stack
                sx={{ alignItems: 'flex-end', flexShrink: 0, maxWidth: 140 }}
                spacing={0.5}
              >
                <StatusBadge status={scan.result} />
                <Typography variant="caption" noWrap sx={{ maxWidth: '100%' }}>
                  {scan.time}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Box>
    </WidgetCard>
  )
}
