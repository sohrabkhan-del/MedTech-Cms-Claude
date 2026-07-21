import type {
  TopEntity,
  revenueSummary,
  ScanActivityPoint,
  RewardMixSlice,
  ActivityEvent,
  RecentScan,
  Redemption,
  SchemeProgress,
  LeaderboardEntry,
  NotificationItem,
} from '@/features/dashboard/mockDashboard'

export type {
  ScanActivityPoint,
  RewardMixSlice,
  ActivityEvent,
  RecentScan,
  TopEntity,
  Redemption,
  SchemeProgress,
  LeaderboardEntry,
  NotificationItem,
} from '@/features/dashboard/mockDashboard'

export interface DashboardOverview {
  topDealers: TopEntity[]
  topChemists: TopEntity[]
  topProducts: TopEntity[]
  revenueSummary: typeof revenueSummary
}

export interface DashboardWidgetsData {
  scanActivityTrend: ScanActivityPoint[]
  rewardMix: RewardMixSlice[]
  activityTimeline: ActivityEvent[]
  recentScans: RecentScan[]
  recentRedemptions: Redemption[]
  schemePerformance: SchemeProgress[]
  leaderboard: LeaderboardEntry[]
  notifications: NotificationItem[]
}

export type DashboardDateRangePreset = 'today' | '7d' | '30d' | 'custom'
