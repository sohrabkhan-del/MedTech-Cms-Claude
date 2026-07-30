// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockSchemeReports,
  getSchemeReportById,
  schemeReportKpis,
  schemeReportRegionOptions,
  schemeReportPartnerTypeOptions,
} from '@/features/reportsAnalytics/mockSchemeReports'
import type { SchemeReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'
import type { PartnerZone } from '@/types/partner'
import type { SchemePartnerType } from '@/features/schemeManagement/types/schemeManagement.types'

export interface SchemeReportFilterOptions {
  regionOptions: PartnerZone[]
  partnerTypeOptions: SchemePartnerType[]
}

const schemeReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchemeReports: builder.query<SchemeReportEntry[], void>({
      query: () => ({
        tag: 'SchemeReports',
        url: '/reports/schemes',
        mockResolver: () => mockDelay(mockSchemeReports),
      }),
      providesTags: [{ type: 'SchemeReports', id: 'LIST' }],
    }),

    getSchemeReportDetail: builder.query<SchemeReportEntry | undefined, string>({
      query: (id) => ({
        tag: 'SchemeReports',
        url: `/reports/schemes/${id}`,
        mockResolver: () => mockDelay(getSchemeReportById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'SchemeReports', id }],
    }),

    getSchemeReportKpis: builder.query<typeof schemeReportKpis, void>({
      query: () => ({
        tag: 'SchemeReports',
        url: '/reports/schemes/kpis',
        mockResolver: () => mockDelay(schemeReportKpis),
      }),
      providesTags: [{ type: 'SchemeReports', id: 'KPIS' }],
    }),

    getSchemeReportFilterOptions: builder.query<SchemeReportFilterOptions, void>({
      query: () => ({
        tag: 'SchemeReports',
        url: '/reports/schemes/filter-options',
        mockResolver: () =>
          mockDelay({
            regionOptions: schemeReportRegionOptions,
            partnerTypeOptions: schemeReportPartnerTypeOptions,
          }),
      }),
      providesTags: [{ type: 'SchemeReports', id: 'FILTER_OPTIONS' }],
    }),
  }),
})

export const {
  useGetSchemeReportsQuery,
  useGetSchemeReportDetailQuery,
  useGetSchemeReportKpisQuery,
  useGetSchemeReportFilterOptionsQuery,
} = schemeReportsApi
