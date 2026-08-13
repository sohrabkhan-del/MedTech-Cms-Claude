import { useNavigate } from 'react-router-dom'
import { Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import type { DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'
import type { Redemption } from '@/features/dashboard/types/dashboard.types'

interface RecentRedemptionsWidgetProps {
  recentRedemptions: Redemption[]
  dateRange: DateRangeValue
  onDateRangeChange: (value: DateRangeValue) => void
}

export function RecentRedemptionsWidget({
  recentRedemptions,
  dateRange,
  onDateRangeChange,
}: RecentRedemptionsWidgetProps) {
  const navigate = useNavigate()

  return (
    <WidgetCard
      title="Recent Redemptions"
      subtitle="Latest gift and wallet redemptions"
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
      onCardClick={() => navigate('/rewards-wallet/reward-redemptions')}
    >
      <Stack spacing={2}>
        {recentRedemptions.map((redemption) => (
          <Stack
            key={redemption.id}
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: redemption.linkTo ? 'Pointer' : 'default',
              borderRadius: 1.5,
              px: 1,
              py: 0.5,
              mx: -1,
              border: '1px solid transparent',
              transition:
                'border-color 0.15s ease, background-color 0.15s ease',
              ...(redemption.linkTo && {
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }),
            }}
            onClick={(e) => {
              if (!redemption.linkTo) return
              e.stopPropagation()
              navigate(redemption.linkTo)
            }}
          >
            <Stack sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }} noWrap>
                {redemption.reward}
              </Typography>
              <Typography variant="caption">
                {redemption.requester} ·{' '}
                {redemption.Points.toLocaleString('en-IN')} pts ·{' '}
                {redemption.date}
              </Typography>
            </Stack>
            <StatusBadge status={redemption.status} />
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  )
}
