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

    getDashboardWidgetsData: builder.query<
      DashboardWidgetsData,
      AnalyticsCardsQueryParams | void
    >({
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

    getActivityTimeline: builder.query<
      ActivityEvent[],
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'Dashboard',
        url: '/audit/timeline',
        params: {
          page: 1,
          limit: 20,
          preset: params?.preset ?? '7d',
          startDate: params?.startDate,
          endDate: params?.endDate,
          regionId: params?.regionId,
        },
        mockResolver: () => mockDelay(activityTimeline),
      }),
      transformResponse: (
        response:
          | {
              success: boolean
              data: {
                items: Array<{
                  id: string
                  action: string
                  entity: string
                  entityId?: string | null
                  before?: unknown
                  after?: Record<string, unknown> | null
                  actor?: {
                    id?: string
                    name?: string
                    type?: string
                    email?: string | null
                  } | null
                  actorId?: string
                  createdAt: string
                }>
                totalItems?: number
              }
            }
          | {
              items: Array<{
                id: string
                action: string
                entity: string
                entityId?: string | null
                before?: unknown
                after?: Record<string, unknown> | null
                actor?: {
                  id?: string
                  name?: string
                  type?: string
                  email?: string | null
                } | null
                actorId?: string
                createdAt: string
              }>
              totalItems?: number
            },
      ): ActivityEvent[] => {
        const data = 'data' in response ? response.data : response

        const formatAction = (value: string) => {
          const normalized = value.toUpperCase()
          const labels: Record<string, string> = {
            CREATE: 'created',
            UPDATE: 'updated',
            DELETE: 'deleted',
            APPROVE: 'approved',
            REJECT: 'rejected',
            LOGIN: 'logged in',
            LOGOUT: 'logged out',
            UPLOAD: 'uploaded',
          }
          return labels[normalized] ?? normalized.toLowerCase()
        }

        const formatEntity = (value: string) =>
          value
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())

        return (data.items ?? []).map((item) => {
          const after =
            item.after && typeof item.after === 'object' ? item.after : null
          const targetValue =
            (after && typeof after.name === 'string' && after.name) ||
            (after &&
              typeof after.customerName === 'string' &&
              after.customerName) ||
            (after &&
              typeof after.productName === 'string' &&
              after.productName) ||
            (after &&
              typeof after.outletName === 'string' &&
              after.outletName) ||
            (item.entity ? formatEntity(item.entity) : 'Record')

          return {
            id: item.id,
            actor: item.actor?.name || item.actorId || 'System',
            action: formatAction(item.action),
            target: targetValue,
            timestamp: new Date(item.createdAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
            linkTo: item.entityId
              ? `/audit/audit-logs/${item.entityId}`
              : undefined,
          }
        })
      },
      providesTags: [{ type: 'Dashboard', id: 'ACTIVITY_TIMELINE' }],
    }),

    getSchemePerformance: builder.query<
      SchemeProgress[],
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'Dashboard',
        url: '/analytics-cards/scheme-performance',
        params: params
          ? {
              preset: params.preset,
              startDate: params.startDate,
              endDate: params.endDate,
              regionId: params.regionId,
            }
          : undefined,
        mockResolver: () => mockDelay(schemePerformance),
      }),
      transformResponse: (
        response:
          | {
              success: boolean
              data: Array<{
                schemeId: string
                schemeName: string
                totalPoints?: number
                redeemedPoints?: number
                redemptionProgress?: number
              }>
            }
          | Array<{
              schemeId: string
              schemeName: string
              totalPoints?: number
              redeemedPoints?: number
              redemptionProgress?: number
            }>,
      ): SchemeProgress[] => {
        const data = 'data' in response ? response.data : response
        return (data ?? []).map((item) => ({
          id: item.schemeId,
          name: item.schemeName,
          category: 'General',
          progress: Number(
            item.totalPoints ??
              item.redeemedPoints ??
              item.redemptionProgress ??
              0,
          ),
          endsIn: 'Live',
        }))
      },
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
