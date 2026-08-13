import { useNavigate } from 'react-router-dom'
import { Grid } from '@mui/material'
import { Coins, CheckCircle2, Gift, TrendingUp } from 'lucide-react'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { StatCard } from '@/components/common/StatCard/StatCard'
import type { DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'
import type { PointsSummary } from '@/features/dashboard/mockDashboard'

interface RevenueSummaryWidgetProps {
  PointsSummary: typeof PointsSummary
  dateRange: DateRangeValue
  onDateRangeChange: (value: DateRangeValue) => void
}

export function RevenueSummaryWidget({
  PointsSummary,
  dateRange,
  onDateRangeChange,
}: RevenueSummaryWidgetProps) {
  const navigate = useNavigate()

  const cards: {
    label: string
    value: string
    icon: React.ReactNode
    iconColor: 'primary' | 'success' | 'secondary' | 'warning'
  }[] = [
    {
      label: 'Total Points Earned',
      value: PointsSummary.totalPointsEarned.toLocaleString('en-IN'),
      icon: <Coins size={18} />,
      iconColor: 'primary',
    },
    {
      label: 'Total Points Claimed',
      value: PointsSummary.totalPointsClaimed.toLocaleString('en-IN'),
      icon: <CheckCircle2 size={18} />,
      iconColor: 'success',
    },
    {
      label: 'Total Reward Points Spent',
      value: PointsSummary.totalRewardPoints.toLocaleString('en-IN'),
      icon: <Gift size={18} />,
      iconColor: 'secondary',
    },
    {
      label: 'Monthly Growth',
      value: PointsSummary.monthlyGrowth,
      icon: <TrendingUp size={18} />,
      iconColor: 'warning',
    },
  ]

  return (
    <WidgetCard
      title="Reward Summary"
      subtitle="Reward economics this month"
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
      onCardClick={() => navigate('/reports/wallet-reports')}
    >
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.label} size={6}>
            <StatCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
            />
          </Grid>
        ))}
      </Grid>
    </WidgetCard>
  )
}
