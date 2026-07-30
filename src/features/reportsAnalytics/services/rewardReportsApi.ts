// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockRewardReports,
  getRewardReportById,
  rewardReportKpis,
  rewardReportUserTypeOptions,
  rewardReportTypeOptions,
  rewardReportSchemeOptions,
  rewardReportStatusOptions,
} from '@/features/reportsAnalytics/mockRewardReports'
import type { RewardReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

export interface RewardReportFilterOptions {
  userTypeOptions: string[]
  rewardTypeOptions: string[]
  schemeOptions: string[]
  statusOptions: string[]
}

const rewardReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRewardReports: builder.query<RewardReportEntry[], void>({
      query: () => ({
        tag: 'RewardReports',
        url: '/reports/rewards',
        mockResolver: () => mockDelay(mockRewardReports),
      }),
      providesTags: [{ type: 'RewardReports', id: 'LIST' }],
    }),

    getRewardReportDetail: builder.query<RewardReportEntry | undefined, string>({
      query: (id) => ({
        tag: 'RewardReports',
        url: `/reports/rewards/${id}`,
        mockResolver: () => mockDelay(getRewardReportById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'RewardReports', id }],
    }),

    getRewardReportKpis: builder.query<typeof rewardReportKpis, void>({
      query: () => ({
        tag: 'RewardReports',
        url: '/reports/rewards/kpis',
        mockResolver: () => mockDelay(rewardReportKpis),
      }),
      providesTags: [{ type: 'RewardReports', id: 'KPIS' }],
    }),

    getRewardReportFilterOptions: builder.query<RewardReportFilterOptions, void>({
      query: () => ({
        tag: 'RewardReports',
        url: '/reports/rewards/filter-options',
        mockResolver: () =>
          mockDelay({
            userTypeOptions: rewardReportUserTypeOptions,
            rewardTypeOptions: rewardReportTypeOptions,
            schemeOptions: rewardReportSchemeOptions,
            statusOptions: rewardReportStatusOptions,
          }),
      }),
      providesTags: [{ type: 'RewardReports', id: 'FILTER_OPTIONS' }],
    }),
  }),
})

export const {
  useGetRewardReportsQuery,
  useGetRewardReportDetailQuery,
  useGetRewardReportKpisQuery,
  useGetRewardReportFilterOptionsQuery,
} = rewardReportsApi
