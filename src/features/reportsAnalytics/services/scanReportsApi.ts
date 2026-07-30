// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockScanReports,
  getScanReportById,
  scanReportKpis,
  scanReportProductOptions,
  scanReportDealerOptions,
  scanReportChemistOptions,
} from '@/features/reportsAnalytics/mockScanReports'
import type { ScanReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

export interface ScanReportFilterOptions {
  productOptions: string[]
  dealerOptions: string[]
  chemistOptions: string[]
}

const scanReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScanReports: builder.query<ScanReportEntry[], void>({
      query: () => ({
        tag: 'ScanReports',
        url: '/reports/scans',
        mockResolver: () => mockDelay(mockScanReports),
      }),
      providesTags: [{ type: 'ScanReports', id: 'LIST' }],
    }),

    getScanReportDetail: builder.query<ScanReportEntry | undefined, string>({
      query: (id) => ({
        tag: 'ScanReports',
        url: `/reports/scans/${id}`,
        mockResolver: () => mockDelay(getScanReportById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ScanReports', id }],
    }),

    getScanReportKpis: builder.query<typeof scanReportKpis, void>({
      query: () => ({
        tag: 'ScanReports',
        url: '/reports/scans/kpis',
        mockResolver: () => mockDelay(scanReportKpis),
      }),
      providesTags: [{ type: 'ScanReports', id: 'KPIS' }],
    }),

    getScanReportFilterOptions: builder.query<ScanReportFilterOptions, void>({
      query: () => ({
        tag: 'ScanReports',
        url: '/reports/scans/filter-options',
        mockResolver: () =>
          mockDelay({
            productOptions: scanReportProductOptions,
            dealerOptions: scanReportDealerOptions,
            chemistOptions: scanReportChemistOptions,
          }),
      }),
      providesTags: [{ type: 'ScanReports', id: 'FILTER_OPTIONS' }],
    }),
  }),
})

export const {
  useGetScanReportsQuery,
  useGetScanReportDetailQuery,
  useGetScanReportKpisQuery,
  useGetScanReportFilterOptionsQuery,
} = scanReportsApi
