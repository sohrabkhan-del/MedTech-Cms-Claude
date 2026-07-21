import { Box, Grid, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import type { revenueSummary } from '@/features/dashboard/mockDashboard'

interface RevenueSummaryWidgetProps {
  revenueSummary: typeof revenueSummary
}

export function RevenueSummaryWidget({
  revenueSummary,
}: RevenueSummaryWidgetProps) {
  const rows: { label: string; value: string }[] = [
    { label: 'Total Points Earned', value: revenueSummary.totalRewardValue },
    {
      label: 'Total Redemptions',
      value: revenueSummary.totalRedemptions.toLocaleString('en-IN'),
    },
    { label: 'Total Points Used', value: revenueSummary.avgOrderValue },
    { label: 'Monthly Growth', value: revenueSummary.monthlyGrowth },
  ]

  return (
    <WidgetCard
      title="Revenue Summary"
      subtitle="Reward economics this month"
      onExport={() => {}}
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
