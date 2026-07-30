// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  PointsSummary,
  scanActivityTrend,
  rewardMix,
  activityTimeline,
  recentRedemptions,
  schemePerformance,
  leaderboard,
  notifications,
} from '@/features/dashboard/mockDashboard'
import type { RecentScan } from '@/features/dashboard/mockDashboard'
import type {
  DashboardOverview,
  DashboardWidgetsData,
  EntityLeaderboardEntry,
} from '@/features/dashboard/types/dashboard.types'
import { mockDelay } from '@/services/mockDelay'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mockScanEvents } from '@/features/fieldOperations/mocks/mockScanFeed'
import type { BadgeStatus } from '@/components/common/StatusBadge/StatusBadge'
import type { ScanResult } from '@/types/scanFeed'

// TODO: replace with real aggregate dashboard endPoints once available.

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
    Points: dealer.totalScans,
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
    Points: chemist.totalRedemptions,
    linkTo: `/partners/chemists/${chemist.id}`,
  }))

const topProductsByName = new Map<string, (typeof mockProducts)[number]>()
for (const product of mockProducts) {
  const existing = topProductsByName.get(product.productName)
  if (
    !existing ||
    product.totalSuccessfulScans > existing.totalSuccessfulScans
  ) {
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
    Points: product.totalSuccessfulScans,
    linkTo: `/inventory/product-master/${product.id}`,
  }))

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverview, void>({
      query: () => ({
        tag: 'Dashboard',
        url: '/dashboard/overview',
        mockResolver: () =>
          mockDelay({
            dealerLeaderboard,
            chemistLeaderboard,
            topProducts,
            PointsSummary,
          }),
      }),
      providesTags: [{ type: 'Dashboard', id: 'OVERVIEW' }],
    }),

    getDashboardWidgetsData: builder.query<DashboardWidgetsData, void>({
      query: () => ({
        tag: 'Dashboard',
        url: '/dashboard/widgets',
        mockResolver: () =>
          mockDelay({
            scanActivityTrend,
            rewardMix,
            activityTimeline,
            recentScans,
            recentRedemptions,
            schemePerformance,
            leaderboard,
            notifications,
          }),
      }),
      providesTags: [{ type: 'Dashboard', id: 'WIDGETS' }],
    }),
  }),
})

export const { useGetDashboardOverviewQuery, useGetDashboardWidgetsDataQuery } = dashboardApi
