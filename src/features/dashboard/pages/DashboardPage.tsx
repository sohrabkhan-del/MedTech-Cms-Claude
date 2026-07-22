import { Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  ScanLine,
  Trophy,
  Wallet,
  ClipboardClock,
  LayoutDashboard,
} from 'lucide-react'
import { WelcomeBanner } from '@/components/common/WelcomeBanner/WelcomeBanner'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { WidgetCardSkeleton } from '@/components/common/WidgetCard/WidgetCardSkeleton'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
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
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <LayoutDashboard size={20} />,
    title: 'Dashboard',
    subtitle:
      'Real-time overview of scans, rewards, and schemes across the network.',
  })
  const { overview, isLoading: overviewLoading } = useDashboardOverview()
  const { data: widgets, isLoading: widgetsLoading } = useDashboardWidgetsData()

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
        onPrimaryAction={() => navigate('/reports/scan-reports')}
        onSecondaryAction={() => navigate('/inventory/factory-inventory-upload/new')}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCardSkeleton />
            </Grid>
          ))
        ) : (
          <>
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
                label="Interest Activity "
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
          </>
        )}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton bodyHeight={320} />
          ) : (
            <ScanActivityChart
              scanActivityTrend={widgets?.scanActivityTrend ?? []}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton bodyHeight={320} />
          ) : (
            <SchemePerformanceChart
              schemePerformance={widgets?.schemePerformance ?? []}
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <ActivityTimelineWidget
              activityTimeline={widgets?.activityTimeline ?? []}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <RecentScansWidget recentScans={widgets?.recentScans ?? []} />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <RewardProgressWidget
              schemePerformance={widgets?.schemePerformance ?? []}
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          {overviewLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <TopEntityListWidget
              title="Top Dealers"
              subtitle="Ranked by scan volume"
              entities={topDealers}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {overviewLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <TopEntityListWidget
              title="Top Chemists"
              subtitle="Ranked by redemptions"
              entities={topChemists}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {overviewLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <TopEntityListWidget
              title="Top Products"
              subtitle="Ranked by units scanned"
              entities={topProducts}
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <RecentRedemptionsWidget
              recentRedemptions={widgets?.recentRedemptions ?? []}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          {overviewLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <RevenueSummaryWidget revenueSummary={revenueSummary} />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <LeaderboardWidget leaderboard={widgets?.leaderboard ?? []} />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <NotificationsWidget notifications={widgets?.notifications ?? []} />
          )}
        </Grid>
      </Grid>
    </>
  )
}
