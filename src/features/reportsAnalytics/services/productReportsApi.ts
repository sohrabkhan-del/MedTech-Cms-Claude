// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockProductReports,
  getProductReportById,
  productReportKpis,
  productReportCategoryOptions,
  productReportBatchOptions,
} from '@/features/reportsAnalytics/mockProductReports'
import type { ProductReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

export interface ProductReportFilterOptions {
  categoryOptions: string[]
  batchOptions: string[]
}

const productReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReports: builder.query<ProductReportEntry[], void>({
      query: () => ({
        tag: 'ProductReports',
        url: '/reports/products',
        mockResolver: () => mockDelay(mockProductReports),
      }),
      providesTags: [{ type: 'ProductReports', id: 'LIST' }],
    }),

    getProductReportDetail: builder.query<ProductReportEntry | undefined, string>({
      query: (id) => ({
        tag: 'ProductReports',
        url: `/reports/products/${id}`,
        mockResolver: () => mockDelay(getProductReportById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ProductReports', id }],
    }),

    getProductReportKpis: builder.query<typeof productReportKpis, void>({
      query: () => ({
        tag: 'ProductReports',
        url: '/reports/products/kpis',
        mockResolver: () => mockDelay(productReportKpis),
      }),
      providesTags: [{ type: 'ProductReports', id: 'KPIS' }],
    }),

    getProductReportFilterOptions: builder.query<ProductReportFilterOptions, void>({
      query: () => ({
        tag: 'ProductReports',
        url: '/reports/products/filter-options',
        mockResolver: () =>
          mockDelay({
            categoryOptions: productReportCategoryOptions,
            batchOptions: productReportBatchOptions,
          }),
      }),
      providesTags: [{ type: 'ProductReports', id: 'FILTER_OPTIONS' }],
    }),
  }),
})

export const {
  useGetProductReportsQuery,
  useGetProductReportDetailQuery,
  useGetProductReportKpisQuery,
  useGetProductReportFilterOptionsQuery,
} = productReportsApi
