// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import { mockWalletReports, getWalletReportById, walletReportKpis } from '@/features/reportsAnalytics/mockWalletReports'
import type { WalletReportDetails, WalletReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

const walletReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWalletReports: builder.query<WalletReportRow[], void>({
      query: () => ({
        tag: 'WalletReports',
        url: '/reports/wallets',
        mockResolver: () => mockDelay(mockWalletReports),
      }),
      providesTags: [{ type: 'WalletReports', id: 'LIST' }],
    }),

    getWalletReportDetail: builder.query<WalletReportDetails | undefined, string>({
      query: (id) => ({
        tag: 'WalletReports',
        url: `/reports/wallets/${id}`,
        mockResolver: () => mockDelay(getWalletReportById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'WalletReports', id }],
    }),

    getWalletReportKpis: builder.query<typeof walletReportKpis, void>({
      query: () => ({
        tag: 'WalletReports',
        url: '/reports/wallets/kpis',
        mockResolver: () => mockDelay(walletReportKpis),
      }),
      providesTags: [{ type: 'WalletReports', id: 'KPIS' }],
    }),
  }),
})

export const { useGetWalletReportsQuery, useGetWalletReportDetailQuery, useGetWalletReportKpisQuery } = walletReportsApi
