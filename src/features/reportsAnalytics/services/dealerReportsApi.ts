// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import { mockDealerReports, getDealerReportById, dealerReportKpis } from '@/features/reportsAnalytics/mockDealerReports'
import type { DealerReportDetails, DealerReportRow } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

const dealerReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDealerReports: builder.query<DealerReportRow[], void>({
      query: () => ({
        tag: 'DealerReports',
        url: '/reports/dealers',
        mockResolver: () => mockDelay(mockDealerReports),
      }),
      providesTags: [{ type: 'DealerReports', id: 'LIST' }],
    }),

    getDealerReportDetail: builder.query<DealerReportDetails | undefined, string>({
      query: (id) => ({
        tag: 'DealerReports',
        url: `/reports/dealers/${id}`,
        mockResolver: () => mockDelay(getDealerReportById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'DealerReports', id }],
    }),

    getDealerReportKpis: builder.query<typeof dealerReportKpis, void>({
      query: () => ({
        tag: 'DealerReports',
        url: '/reports/dealers/kpis',
        mockResolver: () => mockDelay(dealerReportKpis),
      }),
      providesTags: [{ type: 'DealerReports', id: 'KPIS' }],
    }),
  }),
})

export const { useGetDealerReportsQuery, useGetDealerReportDetailQuery, useGetDealerReportKpisQuery } = dealerReportsApi
