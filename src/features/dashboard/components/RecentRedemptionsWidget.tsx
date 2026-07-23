import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import type { DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'
import type { Redemption } from '@/features/dashboard/types/dashboard.types'

interface RecentRedemptionsWidgetProps {
  recentRedemptions: Redemption[]
}

export function RecentRedemptionsWidget({ recentRedemptions }: RecentRedemptionsWidgetProps) {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState<DateRangeValue>('7')

  return (
    <WidgetCard
      title="Recent Redemptions"
      subtitle="Latest gift and wallet redemptions"
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onCardClick={() => navigate('/rewards-wallet/reward-redemptions')}
    >
      <Stack spacing={2}>
        {recentRedemptions.map((redemption) => (
          <Stack
            key={redemption.id}
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', cursor: redemption.linkTo ? 'pointer' : 'default' }}
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
                {redemption.requester} · {redemption.points.toLocaleString('en-IN')} pts · {redemption.date}
              </Typography>
            </Stack>
            <StatusBadge status={redemption.status} />
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  )
}
