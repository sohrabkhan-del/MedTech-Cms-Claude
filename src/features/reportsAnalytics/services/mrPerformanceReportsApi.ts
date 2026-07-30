// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockMrPerformanceReports,
  getMrPerformanceReportById,
  getMrPerformanceDetails,
  mrPerformanceKpis,
} from '@/features/reportsAnalytics/mockMrPerformanceReports'
import type { MrPerformanceDetails, MrPerformanceReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

const mrPerformanceReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMrPerformanceReports: builder.query<MrPerformanceReportRow[], void>({
      query: () => ({
        tag: 'MrPerformanceReports',
        url: '/reports/mr-performance',
        mockResolver: () => mockDelay(mockMrPerformanceReports),
      }),
      providesTags: [{ type: 'MrPerformanceReports', id: 'LIST' }],
    }),

    getMrPerformanceReportDetail: builder.query<MrPerformanceReportRow | undefined, string>({
      query: (id) => ({
        tag: 'MrPerformanceReports',
        url: `/reports/mr-performance/${id}`,
        mockResolver: () => mockDelay(getMrPerformanceReportById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'MrPerformanceReports', id }],
    }),

    getMrPerformanceDetails: builder.query<MrPerformanceDetails | undefined, string>({
      query: (id) => ({
        tag: 'MrPerformanceReports',
        url: `/reports/mr-performance/${id}/details`,
        mockResolver: () => mockDelay(getMrPerformanceDetails(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'MrPerformanceReports', id: `${id}-DETAILS` }],
    }),

    getMrPerformanceKpis: builder.query<typeof mrPerformanceKpis, void>({
      query: () => ({
        tag: 'MrPerformanceReports',
        url: '/reports/mr-performance/kpis',
        mockResolver: () => mockDelay(mrPerformanceKpis),
      }),
      providesTags: [{ type: 'MrPerformanceReports', id: 'KPIS' }],
    }),
  }),
})

export const {
  useGetMrPerformanceReportsQuery,
  useGetMrPerformanceReportDetailQuery,
  useGetMrPerformanceDetailsQuery,
  useGetMrPerformanceKpisQuery,
} = mrPerformanceReportsApi
