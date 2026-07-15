import { Grid } from '@mui/material'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import { WelcomeBanner } from '@/components/common/WelcomeBanner/WelcomeBanner'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { ScanActivityChart } from '@/features/dashboard/widgets/ScanActivityChart'
import { SchemePerformanceChart } from '@/features/dashboard/widgets/SchemePerformanceChart'
import { ActivityTimelineWidget } from '@/features/dashboard/widgets/ActivityTimelineWidget'
import { RecentScansWidget } from '@/features/dashboard/widgets/RecentScansWidget'
import { RewardProgressWidget } from '@/features/dashboard/widgets/RewardProgressWidget'
import { TopEntityListWidget } from '@/features/dashboard/widgets/TopEntityListWidget'
import { RecentRedemptionsWidget } from '@/features/dashboard/widgets/RecentRedemptionsWidget'
import { RevenueSummaryWidget } from '@/features/dashboard/widgets/RevenueSummaryWidget'
import { LeaderboardWidget } from '@/features/dashboard/widgets/LeaderboardWidget'
import { NotificationsWidget } from '@/features/dashboard/widgets/NotificationsWidget'
import { topDealers, topChemists, topProducts } from '@/pages/dashboard/mockData'

export function DashboardPage() {
  return (
    <>
      <WelcomeBanner userName="Suryakant" statValue="1,284" statLabel="Scans today" />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Scan Activity"
            value="8,942"
            icon={<QrCodeScannerIcon fontSize="small" />}
            iconColor="primary"
            trend={{ direction: 'up', value: '+8.3%', caption: 'since last week' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Scheme Progress"
            value="54%"
            icon={<EmojiEventsOutlinedIcon fontSize="small" />}
            iconColor="secondary"
            trend={{ direction: 'up', value: '+3.1%', caption: 'since last week' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Rewards Claimed"
            value="1,842"
            icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
            iconColor="success"
            trend={{ direction: 'up', value: '+12.4%', caption: 'since last week' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Pending Reviews"
            value="17"
            icon={<PendingActionsOutlinedIcon fontSize="small" />}
            iconColor="warning"
            trend={{ direction: 'down', value: '-2.0%', caption: 'since last week' }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ScanActivityChart />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SchemePerformanceChart />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <ActivityTimelineWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <RecentScansWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <RewardProgressWidget />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TopEntityListWidget title="Top Dealers" subtitle="Ranked by scan volume" entities={topDealers} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TopEntityListWidget title="Top Chemists" subtitle="Ranked by redemptions" entities={topChemists} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TopEntityListWidget title="Top Products" subtitle="Ranked by units scanned" entities={topProducts} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <RecentRedemptionsWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <RevenueSummaryWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <LeaderboardWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <NotificationsWidget />
        </Grid>
      </Grid>
    </>
  )
}
