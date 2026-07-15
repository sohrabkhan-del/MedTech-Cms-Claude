import { Box, Grid, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { revenueSummary } from '@/pages/dashboard/mockData'

const rows: { label: string; value: string }[] = [
  { label: 'Total Reward Value', value: revenueSummary.totalRewardValue },
  { label: 'Total Redemptions', value: revenueSummary.totalRedemptions.toLocaleString('en-IN') },
  { label: 'Avg. Order Value', value: revenueSummary.avgOrderValue },
  { label: 'Monthly Growth', value: revenueSummary.monthlyGrowth },
]

export function RevenueSummaryWidget() {
  return (
    <WidgetCard title="Revenue Summary" subtitle="Reward economics this month" onExport={() => {}}>
      <Grid container spacing={2}>
        {rows.map((row) => (
          <Grid key={row.label} size={6}>
            <Box sx={{ backgroundColor: 'background.default', borderRadius: '10px', p: 2 }}>
              <Typography variant="caption">{row.label}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', mt: 0.25 }}>{row.value}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </WidgetCard>
  )
}
