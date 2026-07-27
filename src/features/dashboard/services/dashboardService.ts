import {
  pointsSummary,
  scanActivityTrend,
  rewardMix,
  activityTimeline,
  recentRedemptions,
  schemePerformance,
  leaderboard,
  notifications,
} from '@/features/dashboard/mockDashboard'
import type { RecentScan } from '@/features/dashboard/mockDashboard'
import type { DashboardOverview, DashboardWidgetsData, EntityLeaderboardEntry } from '@/features/dashboard/types/dashboard.types'
import { mockDelay } from '@/services/mockDelay'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mockScanEvents } from '@/features/fieldOperations/mocks/mockScanFeed'
import type { BadgeStatus } from '@/components/common/StatusBadge/StatusBadge'
import type { ScanResult } from '@/types/scanFeed'

// TODO: replace with real aggregate dashboard endpoints once available.

const SCAN_RESULT_TO_BADGE_STATUS: Record<ScanResult, BadgeStatus> = {
  success: 'active',
  failed_outside_geofence: 'inactive',
  failed_duplicate_scan: 'pending',
  failed_invalid_code: 'inactive',
}

// Recent Scans widget mirrors the Live Scan Feed feed so both surfaces show the same data.
const recentScans: RecentScan[] = mockScanEvents
  .slice(-15)
  .reverse()
  .map((scan) => ({
    id: scan.id,
    user: scan.userName,
    role: scan.userRole,
    business: scan.businessName,
    region: scan.region,
    result: SCAN_RESULT_TO_BADGE_STATUS[scan.result],
    time: scan.scanDateTime.replace(' 2026,', ','),
    linkTo: `/field-operations/live-scan-feed/${scan.id}`,
  }))

const dealerLeaderboard: EntityLeaderboardEntry[] = [...mockDealers]
  .sort((a, b) => b.totalScans - a.totalScans)
  .slice(0, 10)
  .map((dealer, index) => ({
    id: dealer.id,
    rank: index + 1,
    name: dealer.shopName,
    region: dealer.zone,
    points: dealer.totalScans,
    linkTo: `/partners/dealers/${dealer.id}`,
  }))

const chemistLeaderboard: EntityLeaderboardEntry[] = [...mockChemists]
  .sort((a, b) => b.totalRedemptions - a.totalRedemptions)
  .slice(0, 10)
  .map((chemist, index) => ({
    id: chemist.id,
    rank: index + 1,
    name: chemist.shopName,
    region: chemist.zone,
    points: chemist.totalRedemptions,
    linkTo: `/partners/chemists/${chemist.id}`,
  }))

const topProductsByName = new Map<string, (typeof mockProducts)[number]>()
for (const product of mockProducts) {
  const existing = topProductsByName.get(product.productName)
  if (!existing || product.totalSuccessfulScans > existing.totalSuccessfulScans) {
    topProductsByName.set(product.productName, product)
  }
}

const topProducts: EntityLeaderboardEntry[] = [...topProductsByName.values()]
  .sort((a, b) => b.totalSuccessfulScans - a.totalSuccessfulScans)
  .slice(0, 10)
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
