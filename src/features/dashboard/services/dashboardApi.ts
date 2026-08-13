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
  ActivityEvent,
  DashboardOverview,
  DashboardWidgetsData,
  EntityLeaderboardEntry,
  SchemeProgress,
} from '@/features/dashboard/types/dashboard.types'
import type { AnalyticsCardsQueryParams } from '@/features/dashboard/types/analyticsCards.types'
import { mockDelay } from '@/services/mockDelay'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
// TODO: replace with real aggregate dashboard endPoints once available.

// Recent Scans widget mirrors the Live Scan Feed feed so both surfaces show the same data.
// TODO: source from GET /product-scan once the dashboard widgets endpoint is real.
const recentScans: RecentScan[] = []

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

    getDashboardWidgetsData: builder.query<DashboardWidgetsData, AnalyticsCardsQueryParams | void>({
      query: (params) => ({
        tag: 'Dashboard',
        url: '/dashboard/widgets',
        params: params ? { regionId: params.regionId } : undefined,
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

    getActivityTimeline: builder.query<ActivityEvent[], AnalyticsCardsQueryParams | void>({
      query: (params) => ({
        tag: 'Dashboard',
        url: '/dashboard/activity-timeline',
        params: params
          ? { regionId: params.regionId, preset: params.preset }
          : undefined,
        mockResolver: () => mockDelay(activityTimeline),
      }),
      providesTags: [{ type: 'Dashboard', id: 'ACTIVITY_TIMELINE' }],
    }),

    getSchemePerformance: builder.query<SchemeProgress[], AnalyticsCardsQueryParams | void>({
      query: (params) => ({
        tag: 'Dashboard',
        url: '/dashboard/scheme-performance',
        params: params
          ? { regionId: params.regionId, preset: params.preset }
          : undefined,
        mockResolver: () => mockDelay(schemePerformance),
      }),
      providesTags: [{ type: 'Dashboard', id: 'SCHEME_PERFORMANCE' }],
    }),
  }),
})

export const {
  useGetDashboardOverviewQuery,
  useGetDashboardWidgetsDataQuery,
  useGetActivityTimelineQuery,
  useGetSchemePerformanceQuery,
} = dashboardApi
