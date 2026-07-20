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
} from '@/features/dashboard/mocks/mockDashboardData'
import type { DashboardOverview, DashboardWidgetsData } from '@/features/dashboard/types/dashboard.types'

// TODO: replace with real aggregate dashboard endpoints once available.

async function getOverview(): Promise<DashboardOverview> {
  return Promise.resolve({ topDealers, topChemists, topProducts, revenueSummary })
}

async function getWidgetsData(): Promise<DashboardWidgetsData> {
  return Promise.resolve({
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
