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
import { useDashboardWidgetsData } from '@/features/dashboard/hooks/useDashboardWidgetsData'
import {
  useActivityTimelineCard,
  useDashboardOverviewCards,
  useRecentRedemptionsCard,
  useRecentScansCard,
  useRewardSummaryCard,
  useScanActivityGraph,
  useSchemePerformanceCard,
  useTopPartnersCard,
  useTopProductsCard,
} from '@/features/dashboard/hooks/useAnalyticsCards'
import { SchemePerformanceChart } from '@/features/dashboard/components/SchemePerformanceChart'
import { useAppSelector } from '@/app/store/hooks'
import { selectCurrentUser } from '@/features/auth/slices/authSelectors'
import type {
  RecentScan,
  Redemption,
} from '@/features/dashboard/types/dashboard.types'
import type {
  DateRangeValue,
  ScanDateRangeValue,
} from '@/components/common/DateRangeSelect/DateRangeSelect'

function formatChange(value: number) {
  const rounded = Math.round(value * 10) / 10
  return {
    direction: (rounded >= 0 ? 'up' : 'down') as 'up' | 'down',
    value: `${rounded >= 0 ? '+' : ''}${rounded}%`,
  }
}

export function DashboardPage() {
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectCurrentUser)
  const { isLoading: widgetsLoading } = useDashboardWidgetsData()

  const [scanActivityDateRange, setScanActivityDateRange] =
    useState<DateRangeValue>('7')
  const [schemePerformanceDateRange, setSchemePerformanceDateRange] =
    useState<DateRangeValue>('7')
  const [activityTimelineDateRange, setActivityTimelineDateRange] =
    useState<DateRangeValue>('7')
  const [recentScansDateRange, setRecentScansDateRange] =
    useState<ScanDateRangeValue>('7')
  const [rewardSummaryDateRange, setRewardSummaryDateRange] =
    useState<DateRangeValue>('7')
  const [recentRedemptionsDateRange, setRecentRedemptionsDateRange] =
    useState<DateRangeValue>('7')

  const { overview: overviewCards, isLoading: overviewCardsLoading } =
    useDashboardOverviewCards()
  const { scanActivityGraph, isLoading: scanActivityLoading } =
    useScanActivityGraph(scanActivityDateRange)
  const { schemePerformance, isLoading: schemePerformanceLoading } =
    useSchemePerformanceCard(schemePerformanceDateRange)
  const { activityTimeline, isLoading: activityTimelineLoading } =
    useActivityTimelineCard(activityTimelineDateRange)
  const { recentScans, isLoading: recentScansLoading } = useRecentScansCard(
    recentScansDateRange,
  )
  const {
    topDealers,
    topChemists,
    isLoading: topPartnersLoading,
  } = useTopPartnersCard()
  const { topProducts: topProductCards, isLoading: topProductsLoading } =
    useTopProductsCard()
  const {
    recentRedemptions: recentRedemptionCards,
    isLoading: recentRedemptionsLoading,
  } = useRecentRedemptionsCard(recentRedemptionsDateRange)
  const { rewardSummary, isLoading: rewardSummaryLoading } =
    useRewardSummaryCard(rewardSummaryDateRange)

  useRegionTopbarHeader({
    icon: <LayoutDashboard size={20} />,
    title: 'Dashboard',
    subtitle:
      'Real-time overview of scans, rewards, and schemes across the network.',
    isLoading: widgetsLoading || overviewCardsLoading,
  })

  return (
    <>
      <WelcomeBanner
        userName={currentUser?.name ?? 'Admin'}
        statValue="1,284"
        statLabel="Scans today"
        onPrimaryAction={() => navigate('/reports/scan-reports')}
        onSecondaryAction={() =>
          navigate('/inventory/factory-inventory-upload/new')
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {overviewCardsLoading ? (
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
                value={(overviewCards?.scanActivity ?? 0).toLocaleString(
                  'en-IN',
                )}
                icon={<ScanLine size={20} />}
                iconColor="primary"
                trend={{
                  ...formatChange(overviewCards?.scanActivityChange ?? 0),
                  caption: 'since last period',
                }}
                onClick={() => navigate('/reports/scan-reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Rewards Claimed"
                value={(overviewCards?.rewardsClaimed ?? 0).toLocaleString(
                  'en-IN',
                )}
                icon={<Wallet size={20} />}
                iconColor="success"
                trend={{
                  ...formatChange(overviewCards?.rewardsClaimedChange ?? 0),
                  caption: 'since last period',
                }}
                onClick={() => navigate('/reports/wallet-reports')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              {' '}
              <StatCard
                label="Pending Reviews"
                value={(overviewCards?.pendingReviews ?? 0).toLocaleString(
                  'en-IN',
                )}
                icon={<ClipboardClock size={20} />}
                iconColor="warning"
                trend={{
                  ...formatChange(overviewCards?.pendingReviewsChange ?? 0),
                  caption: 'since last period',
                }}
                onClick={() => navigate('/verification/approval-requests')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Interest Activity "
                value={`${overviewCards?.interestActivity ?? 0}%`}
                icon={<Trophy size={20} />}
                iconColor="secondary"
                trend={{
                  ...formatChange(overviewCards?.interestActivityChange ?? 0),
                  caption: 'since last period',
                }}
                onClick={() => navigate('/marketing-products/interested-users')}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          {scanActivityLoading ? (
            <WidgetCardSkeleton bodyHeight={320} />
          ) : (
            <ScanActivityChart
              scanActivityTrend={scanActivityGraph.map((point) => ({
                day: point.date,
                scans: point.scans,
                rewards: point.rewards,
              }))}
              dateRange={scanActivityDateRange}
              onDateRangeChange={setScanActivityDateRange}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          {schemePerformanceLoading ? (
            <WidgetCardSkeleton bodyHeight={320} />
          ) : (
            <SchemePerformanceChart
              schemePerformance={schemePerformance}
              dateRange={schemePerformanceDateRange}
              onDateRangeChange={setSchemePerformanceDateRange}
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {activityTimelineLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <ActivityTimelineWidget
              activityTimeline={activityTimeline}
              dateRange={activityTimelineDateRange}
              onDateRangeChange={setActivityTimelineDateRange}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {recentScansLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <RecentScansWidget
              recentScans={recentScans.map((scan) => ({
                id: scan.id,
                user: scan.contactName,
                role: scan.role,
                business: scan.outletName,
                region: scan.region,
                result: scan.status.toLowerCase() as RecentScan['result'],
                time: scan.timeAgo,
              }))}
              dateRange={recentScansDateRange}
              onDateRangeChange={setRecentScansDateRange}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {schemePerformanceLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <RewardProgressWidget schemePerformance={schemePerformance} />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {topPartnersLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <LeaderboardWidget
              leaderboard={topDealers.map((dealer, index) => ({
                id: dealer.partnerId,
                rank: index + 1,
                name: dealer.businessName,
                region: dealer.region,
                Points: dealer.scanCount,
                linkTo: `/partners/dealers/${dealer.partnerId}`,
              }))}
              title="Top Dealers"
              subtitle="Ranked by scan volume"
              linkTo="/partners/dealers"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {topPartnersLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <LeaderboardWidget
              leaderboard={topChemists.map((chemist, index) => ({
                id: chemist.partnerId,
                rank: index + 1,
                name: chemist.businessName,
                region: chemist.region,
                Points: chemist.redemptionCount,
                linkTo: `/partners/chemists/${chemist.partnerId}`,
              }))}
              title="Top Chemists"
              subtitle="Ranked by redemptions"
              linkTo="/partners/chemists"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          {topProductsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <LeaderboardWidget
              leaderboard={topProductCards.map((product, index) => ({
                id: product.productId,
                rank: index + 1,
                name: product.productName,
                region: product.category,
                Points: product.scanCount,
                linkTo: `/inventory/product-master/${product.productId}`,
              }))}
              title="Top Products"
              subtitle="Ranked by units scanned"
              linkTo="/inventory/product-master"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 12 }}>
          {rewardSummaryLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <RevenueSummaryWidget
              PointsSummary={{
                totalPointsEarned: rewardSummary?.totalPointsEarned ?? 0,
                totalPointsClaimed: rewardSummary?.totalPointsClaimed ?? 0,
                totalRewardPoints: rewardSummary?.totalPointsSpent ?? 0,
                monthlyGrowth: `${(rewardSummary?.monthlyGrowth ?? 0) >= 0 ? '+' : ''}${rewardSummary?.monthlyGrowth ?? 0}%`,
              }}
              dateRange={rewardSummaryDateRange}
              onDateRangeChange={setRewardSummaryDateRange}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          {recentRedemptionsLoading ? (
            <WidgetCardSkeleton />
          ) : (
            <RecentRedemptionsWidget
              recentRedemptions={recentRedemptionCards.map((redemption) => ({
                id: redemption.id,
                requester: redemption.businessName,
                reward: redemption.itemName,
                Points: redemption.points,
                status: redemption.status.toLowerCase() as Redemption['status'],
                date: new Date(redemption.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }),
              }))}
              dateRange={recentRedemptionsDateRange}
              onDateRangeChange={setRecentRedemptionsDateRange}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <NotificationsWidget />
        </Grid>
      </Grid>
    </>
  )
}
