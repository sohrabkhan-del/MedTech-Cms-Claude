// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockChemistReports,
  getChemistReportById,
  getChemistPerformanceSummary,
  chemistReportKpis,
} from '@/features/reportsAnalytics/mockChemistReports'
import type { ChemistPerformanceSummary, ChemistReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

const chemistReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChemistReports: builder.query<ChemistReportRow[], void>({
      query: () => ({
        tag: 'ChemistReports',
        url: '/reports/chemists',
        mockResolver: () => mockDelay(mockChemistReports),
      }),
      providesTags: [{ type: 'ChemistReports', id: 'LIST' }],
    }),

    getChemistReportDetail: builder.query<ChemistReportRow | undefined, string>({
      query: (id) => ({
        tag: 'ChemistReports',
        url: `/reports/chemists/${id}`,
        mockResolver: () => mockDelay(getChemistReportById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ChemistReports', id }],
    }),

    getChemistPerformanceSummary: builder.query<ChemistPerformanceSummary | undefined, string>({
      query: (id) => ({
        tag: 'ChemistReports',
        url: `/reports/chemists/${id}/performance-summary`,
        mockResolver: () => mockDelay(getChemistPerformanceSummary(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ChemistReports', id: `${id}-PERFORMANCE_SUMMARY` }],
    }),

    getChemistReportKpis: builder.query<typeof chemistReportKpis, void>({
      query: () => ({
        tag: 'ChemistReports',
        url: '/reports/chemists/kpis',
        mockResolver: () => mockDelay(chemistReportKpis),
      }),
      providesTags: [{ type: 'ChemistReports', id: 'KPIS' }],
    }),
  }),
})

export const {
  useGetChemistReportsQuery,
  useGetChemistReportDetailQuery,
  useGetChemistPerformanceSummaryQuery,
  useGetChemistReportKpisQuery,
} = chemistReportsApi
