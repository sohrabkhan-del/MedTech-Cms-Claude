import {
  topDealers,
  topChemists,
  topProducts,
  revenueSummary,
  scanActivityTrend,
  rewardMix,
  activityTimeline,
  recentScans,
  recentRedemptions,
  schemePerformance,
  leaderboard,
  notifications,
} from '@/features/dashboard/mockDashboard'
import type { DashboardOverview, DashboardWidgetsData } from '@/features/dashboard/types/dashboard.types'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace with real aggregate dashboard endpoints once available.

async function getOverview(): Promise<DashboardOverview> {
  return mockDelay({ topDealers, topChemists, topProducts, revenueSummary })
}

async function getWidgetsData(): Promise<DashboardWidgetsData> {
  return mockDelay({
    scanActivityTrend,
    rewardMix,
    activityTimeline,
    recentScans,
    recentRedemptions,
    schemePerformance,
    leaderboard,
    notifications,
  })
}

export const dashboardService = {
  getOverview,
  getWidgetsData,
}
