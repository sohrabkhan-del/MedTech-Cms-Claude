import {
  dealerLeaderboard,
  chemistLeaderboard,
  pointsSummary,
  scanActivityTrend,
  rewardMix,
  activityTimeline,
  recentScans,
  recentRedemptions,
  schemePerformance,
  leaderboard,
  notifications,
} from '@/features/dashboard/mockDashboard'
import type { DashboardOverview, DashboardWidgetsData, EntityLeaderboardEntry } from '@/features/dashboard/types/dashboard.types'
import { mockDelay } from '@/services/mockDelay'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'

// TODO: replace with real aggregate dashboard endpoints once available.

const topProductsByName = new Map<string, (typeof mockProducts)[number]>()
for (const product of mockProducts) {
  const existing = topProductsByName.get(product.productName)
  if (!existing || product.totalSuccessfulScans > existing.totalSuccessfulScans) {
    topProductsByName.set(product.productName, product)
  }
}

const topProducts: EntityLeaderboardEntry[] = [...topProductsByName.values()]
  .sort((a, b) => b.totalSuccessfulScans - a.totalSuccessfulScans)
  .slice(0, 5)
  .map((product, index) => ({
    id: product.id,
    rank: index + 1,
    name: product.productName,
    region: product.productCategory,
    points: product.totalSuccessfulScans,
    linkTo: `/inventory/product-master/${product.id}`,
  }))

async function getOverview(): Promise<DashboardOverview> {
  return mockDelay({ dealerLeaderboard, chemistLeaderboard, topProducts, pointsSummary })
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
