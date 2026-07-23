import { useState } from 'react'
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
import { ActivityTimelineWidget } from '@/features/dashboard/components/ActivityTimelineWidget'
import { RecentScansWidget } from '@/features/dashboard/components/RecentScansWidget'
import { RewardProgressWidget } from '@/features/dashboard/components/RewardProgressWidget'
import { RecentRedemptionsWidget } from '@/features/dashboard/components/RecentRedemptionsWidget'
import { RevenueSummaryWidget } from '@/features/dashboard/components/RevenueSummaryWidget'
import { LeaderboardWidget } from '@/features/dashboard/components/LeaderboardWidget'
import { NotificationsWidget } from '@/features/dashboard/components/NotificationsWidget'
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview'
import { useDashboardWidgetsData } from '@/features/dashboard/hooks/useDashboardWidgetsData'

export function DashboardPage() {
  const navigate = useNavigate()
  const { overview, isLoading: overviewLoading } = useDashboardOverview()
  const { data: widgets, isLoading: widgetsLoading } = useDashboardWidgetsData()
  const isLoaded = !overviewLoading && !widgetsLoading

  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined)
  const [wasLoaded, setWasLoaded] = useState(false)
  if (isLoaded && !wasLoaded) {
    setWasLoaded(true)
    setLastUpdated(new Date())
  }

  useRegionTopbarHeader({
    icon: <LayoutDashboard size={20} />,
    title: 'Dashboard',
    subtitle:
      'Real-time overview of scans, rewards, and schemes across the network.',
    lastUpdated,
  })

  const dealerLeaderboard = overview?.dealerLeaderboard ?? []
  const chemistLeaderboard = overview?.chemistLeaderboard ?? []
  const topProducts = overview?.topProducts ?? []
  const pointsSummary = overview?.pointsSummary ?? {
    totalPointsEarned: 0,
    totalPointsClaimed: 0,
    totalRewardPoints: 0,
    monthlyGrowth: '0%',
  }

  return (
    <>
      <WelcomeBanner
        userName="Suryakant"
        statValue="1,284"
        statLabel="Scans today"
        onPrimaryAction={() => navigate('/reports/scan-reports')}
        onSecondaryAction={() =>
          navigate('/inventory/factory-inventory-upload/new')
        }
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
                onClick={() => navigate('/reports/scan-reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Rewards Claimed"
                value={pointsSummary.totalPointsClaimed.toLocaleString('en-IN')}
                icon={<Wallet size={20} />}
                iconColor="success"
                trend={{
                  direction: 'up',
                  value: '+12.4%',
                  caption: 'since last week',
                }}
                onClick={() => navigate('/reports/wallet-reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              {' '}
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
                onClick={() => navigate('/verification/approval-requests')}
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
                onClick={() => navigate('/marketing-products/interested-users')}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 12 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton bodyHeight={320} />
          ) : (
            <ScanActivityChart
              scanActivityTrend={widgets?.scanActivityTrend ?? []}
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
        <Grid size={{ xs: 12, md: 6 }}>
          {overviewLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <LeaderboardWidget
              leaderboard={dealerLeaderboard}
              title="Top Dealers"
              subtitle="Ranked by scan volume"
              linkTo="/partners/dealers"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {overviewLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <LeaderboardWidget
              leaderboard={chemistLeaderboard}
              title="Top Chemists"
              subtitle="Ranked by redemptions"
              linkTo="/partners/chemists"
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
            <RevenueSummaryWidget pointsSummary={pointsSummary} />
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          {widgetsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <NotificationsWidget notifications={widgets?.notifications ?? []} />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          {overviewLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <LeaderboardWidget
              leaderboard={topProducts}
              title="Top Products"
              subtitle="Ranked by units scanned"
              linkTo="/inventory/product-master"
            />
          )}
        </Grid>
      </Grid>
    </>
  )
}
