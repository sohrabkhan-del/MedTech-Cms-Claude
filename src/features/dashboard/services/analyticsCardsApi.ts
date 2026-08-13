import { baseApi } from '@/store/api/baseApi'
import type {
  AnalyticsCardsQueryParams,
  DashboardOverviewCards,
  RecentRedemptionCard,
  RecentScanCard,
  RewardSummaryCard,
  ScanActivityGraphPoint,
  TopPartnersCard,
  TopProductCard,
} from '@/features/dashboard/types/analyticsCards.types'

function unwrap<T>(response: { success: boolean; data: T } | T): T {
  return response && typeof response === 'object' && 'data' in response
    ? (response as { data: T }).data
    : (response as T)
}

const noMock = () => {
  throw new Error('Analytics cards have no mock mode — real API only.')
}

const analyticsCardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverviewCards: builder.query<
      DashboardOverviewCards,
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'AnalyticsCards',
        url: '/analytics-cards/dashboard-overview',
        params,
        mockResolver: noMock,
      }),
      transformResponse: unwrap<DashboardOverviewCards>,
      providesTags: [{ type: 'AnalyticsCards', id: 'OVERVIEW' }],
    }),

    getScanActivityGraph: builder.query<
      ScanActivityGraphPoint[],
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'AnalyticsCards',
        url: '/analytics-cards/scan-activity-graph',
        params,
        mockResolver: noMock,
      }),
      transformResponse: unwrap<ScanActivityGraphPoint[]>,
      providesTags: [{ type: 'AnalyticsCards', id: 'SCAN_ACTIVITY_GRAPH' }],
    }),

    getRecentScansCard: builder.query<
      RecentScanCard[],
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'AnalyticsCards',
        url: '/analytics-cards/recent-scans',
        params,
        mockResolver: noMock,
      }),
      transformResponse: unwrap<RecentScanCard[]>,
      providesTags: [{ type: 'AnalyticsCards', id: 'RECENT_SCANS' }],
    }),

    getTopPartnersCard: builder.query<
      TopPartnersCard,
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'AnalyticsCards',
        url: '/analytics-cards/top-partners',
        params,
        mockResolver: noMock,
      }),
      transformResponse: unwrap<TopPartnersCard>,
      providesTags: [{ type: 'AnalyticsCards', id: 'TOP_PARTNERS' }],
    }),

    getTopProductsCard: builder.query<
      TopProductCard[],
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'AnalyticsCards',
        url: '/analytics-cards/top-products',
        params,
        mockResolver: noMock,
      }),
      transformResponse: unwrap<TopProductCard[]>,
      providesTags: [{ type: 'AnalyticsCards', id: 'TOP_PRODUCTS' }],
    }),

    getRecentRedemptionsCard: builder.query<
      RecentRedemptionCard[],
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'AnalyticsCards',
        url: '/analytics-cards/recent-redemptions',
        params,
        mockResolver: noMock,
      }),
      transformResponse: unwrap<RecentRedemptionCard[]>,
      providesTags: [{ type: 'AnalyticsCards', id: 'RECENT_REDEMPTIONS' }],
    }),

    getRewardSummaryCard: builder.query<
      RewardSummaryCard,
      AnalyticsCardsQueryParams | void
    >({
      query: (params) => ({
        tag: 'AnalyticsCards',
        url: '/analytics-cards/reward-summary',
        params,
        mockResolver: noMock,
      }),
      transformResponse: unwrap<RewardSummaryCard>,
      providesTags: [{ type: 'AnalyticsCards', id: 'REWARD_SUMMARY' }],
    }),
  }),
})

export const {
  useGetDashboardOverviewCardsQuery,
  useGetScanActivityGraphQuery,
  useGetRecentScansCardQuery,
  useGetTopPartnersCardQuery,
  useGetTopProductsCardQuery,
  useGetRecentRedemptionsCardQuery,
  useGetRewardSummaryCardQuery,
} = analyticsCardsApi
