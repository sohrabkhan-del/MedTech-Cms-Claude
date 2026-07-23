import type {
  EntityLeaderboardEntry,
  pointsSummary,
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
  EntityLeaderboardEntry,
  Redemption,
  SchemeProgress,
  LeaderboardEntry,
  NotificationItem,
} from '@/features/dashboard/mockDashboard'

export interface DashboardOverview {
  dealerLeaderboard: EntityLeaderboardEntry[]
  chemistLeaderboard: EntityLeaderboardEntry[]
  topProducts: EntityLeaderboardEntry[]
  pointsSummary: typeof pointsSummary
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
