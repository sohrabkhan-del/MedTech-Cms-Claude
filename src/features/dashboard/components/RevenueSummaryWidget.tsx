import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Grid, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import type { DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'
import type { pointsSummary } from '@/features/dashboard/mockDashboard'

interface RevenueSummaryWidgetProps {
  pointsSummary: typeof pointsSummary
}

export function RevenueSummaryWidget({
  pointsSummary,
}: RevenueSummaryWidgetProps) {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeValue>('7')

  const rows: { label: string; value: string }[] = [
    {
      label: 'Total Points Earned',
      value: pointsSummary.totalPointsEarned.toLocaleString('en-IN'),
    },
    {
      label: 'Total Points Claimed',
      value: pointsSummary.totalPointsClaimed.toLocaleString('en-IN'),
    },
    {
      label: 'Total Reward Points Spent',
      value: pointsSummary.totalRewardPoints.toLocaleString('en-IN'),
    },
    { label: 'Monthly Growth', value: pointsSummary.monthlyGrowth },
  ]

  return (
    <WidgetCard
      title="Reward Summary"
      subtitle="Reward economics this month"
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onCardClick={() => navigate('/reports/wallet-reports')}
    >
      <Grid container spacing={2}>
        {rows.map((row) => (
          <Grid key={row.label} size={6}>
            <Box
              sx={{
                backgroundColor: 'background.default',
                borderRadius: '10px',
                p: 2,
              }}
            >
              <Typography variant="caption">{row.label}</Typography>
              <Typography
                sx={{ fontWeight: 700, fontSize: '1.25rem', mt: 0.25 }}
              >
                {row.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </WidgetCard>
  )
}
