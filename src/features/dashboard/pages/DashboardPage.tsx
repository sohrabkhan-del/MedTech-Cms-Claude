import { Grid } from '@mui/material'
import { ScanLine, Trophy, Wallet, ClipboardClock } from 'lucide-react'
import { WelcomeBanner } from '@/components/common/WelcomeBanner/WelcomeBanner'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { ScanActivityChart } from '@/features/dashboard/components/ScanActivityChart'
import { SchemePerformanceChart } from '@/features/dashboard/components/SchemePerformanceChart'
import { ActivityTimelineWidget } from '@/features/dashboard/components/ActivityTimelineWidget'
import { RecentScansWidget } from '@/features/dashboard/components/RecentScansWidget'
import { RewardProgressWidget } from '@/features/dashboard/components/RewardProgressWidget'
import { TopEntityListWidget } from '@/features/dashboard/components/TopEntityListWidget'
import { RecentRedemptionsWidget } from '@/features/dashboard/components/RecentRedemptionsWidget'
import { RevenueSummaryWidget } from '@/features/dashboard/components/RevenueSummaryWidget'
import { LeaderboardWidget } from '@/features/dashboard/components/LeaderboardWidget'
import { NotificationsWidget } from '@/features/dashboard/components/NotificationsWidget'
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview'
import { useDashboardWidgetsData } from '@/features/dashboard/hooks/useDashboardWidgetsData'

export function DashboardPage() {
  const { overview } = useDashboardOverview()
  const { data: widgets } = useDashboardWidgetsData()

  const topDealers = overview?.topDealers ?? []
  const topChemists = overview?.topChemists ?? []
  const topProducts = overview?.topProducts ?? []
  const revenueSummary = overview?.revenueSummary ?? {
    totalRewardValue: '₹0',
    totalRedemptions: 0,
    avgOrderValue: '₹0',
    monthlyGrowth: '0%',
  }

  return (
    <>
      <WelcomeBanner
        userName="Suryakant"
        statValue="1,284"
        statLabel="Scans today"
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Scan Activity"
            value="8,942"
            icon={<ScanLine size={20} />}
            iconColor="primary"
            trend={{
              direction: 'up',
              value: '+8.3%',
              caption: 'since last week',
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Scheme Progress"
            value="54%"
            icon={<Trophy size={20} />}
            iconColor="secondary"
            trend={{
              direction: 'up',
              value: '+3.1%',
              caption: 'since last week',
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Rewards Claimed"
            value="1,842"
            icon={<Wallet size={20} />}
            iconColor="success"
            trend={{
              direction: 'up',
              value: '+12.4%',
              caption: 'since last week',
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Pending Reviews"
            value="17"
            icon={<ClipboardClock size={20} />}
            iconColor="warning"
            trend={{
              direction: 'down',
              value: '-2.0%',
              caption: 'since last week',
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ScanActivityChart scanActivityTrend={widgets?.scanActivityTrend ?? []} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SchemePerformanceChart schemePerformance={widgets?.schemePerformance ?? []} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <ActivityTimelineWidget activityTimeline={widgets?.activityTimeline ?? []} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <RecentScansWidget recentScans={widgets?.recentScans ?? []} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <RewardProgressWidget schemePerformance={widgets?.schemePerformance ?? []} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TopEntityListWidget
            title="Top Dealers"
            subtitle="Ranked by scan volume"
            entities={topDealers}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TopEntityListWidget
            title="Top Chemists"
            subtitle="Ranked by redemptions"
            entities={topChemists}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TopEntityListWidget
            title="Top Products"
            subtitle="Ranked by units scanned"
            entities={topProducts}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <RecentRedemptionsWidget recentRedemptions={widgets?.recentRedemptions ?? []} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <RevenueSummaryWidget revenueSummary={revenueSummary} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <LeaderboardWidget leaderboard={widgets?.leaderboard ?? []} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <NotificationsWidget notifications={widgets?.notifications ?? []} />
        </Grid>
      </Grid>
    </>
  )
}
