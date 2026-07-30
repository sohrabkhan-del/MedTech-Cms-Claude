// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockProductBatches,
  getProductBatchById,
  productBatchKpis,
  getMockProductionBatches,
  getProductionBatchById,
  getProductionBatchKpis,
  getScanAnalyticsRows as getScanAnalyticsRowsData,
  buildProductionBatchFromUpload,
  addProductionBatches,
} from '@/features/inventoryManagement/mockProductBatches'
import type { ProductBatch, ProductionBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { MappedBatch } from '@/types/batchUidUpload'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// product batches API is available.

export interface ImportUploadedBatchesArgs {
  mappedBatches: MappedBatch[]
  uploadFileName: string
}

const productBatchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // "Scanning Products" tab — read-only listing derived from mock factory batches.
    getProductBatches: builder.query<ProductBatch[], void>({
      query: () => ({
        tag: 'ProductBatches',
        url: '/product-batches/scanning',
        mockResolver: () => mockDelay(mockProductBatches),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ProductBatches' as const, id })),
              { type: 'ProductBatches' as const, id: 'SCANNING_LIST' },
            ]
          : [{ type: 'ProductBatches' as const, id: 'SCANNING_LIST' }],
    }),

    getProductBatchDetail: builder.query<ProductBatch | undefined, string>({
      query: (id) => ({
        tag: 'ProductBatches',
        url: `/product-batches/scanning/${id}`,
        mockResolver: () => mockDelay(getProductBatchById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ProductBatches', id }],
    }),

    getProductBatchKpis: builder.query<typeof productBatchKpis, void>({
      query: () => ({
        tag: 'ProductBatches',
        url: '/product-batches/scanning/kpis',
        mockResolver: () => mockDelay(productBatchKpis),
      }),
      providesTags: [{ type: 'ProductBatches', id: 'SCANNING_KPIS' }],
    }),

    // "Batch Listing" tab — starts empty, populated via Batch & UID Upload imports.
    getProductionBatches: builder.query<ProductionBatch[], void>({
      query: () => ({
        tag: 'ProductBatches',
        url: '/product-batches/production',
        mockResolver: () => mockDelay(getMockProductionBatches()),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ProductBatches' as const, id })),
              { type: 'ProductBatches' as const, id: 'PRODUCTION_LIST' },
            ]
          : [{ type: 'ProductBatches' as const, id: 'PRODUCTION_LIST' }],
    }),

    getProductionBatchDetail: builder.query<ProductionBatch | undefined, string>({
      query: (id) => ({
        tag: 'ProductBatches',
        url: `/product-batches/production/${id}`,
        mockResolver: () => mockDelay(getProductionBatchById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'ProductBatches', id }],
    }),

    getProductionBatchKpis: builder.query<ReturnType<typeof getProductionBatchKpis>, void>({
      query: () => ({
        tag: 'ProductBatches',
        url: '/product-batches/production/kpis',
        mockResolver: () => mockDelay(getProductionBatchKpis()),
      }),
      providesTags: [{ type: 'ProductBatches', id: 'PRODUCTION_KPIS' }],
    }),

    getScanAnalyticsRows: builder.query<ReturnType<typeof getScanAnalyticsRowsData>, void>({
      query: () => ({
        tag: 'ProductBatches',
        url: '/product-batches/production/scan-analytics',
        mockResolver: () => mockDelay(getScanAnalyticsRowsData()),
      }),
      providesTags: [{ type: 'ProductBatches', id: 'SCAN_ANALYTICS' }],
    }),

    /** Imports Batch & UID Upload results (Upload Manifest) into the Product Batches registry. */
    importUploadedBatches: builder.mutation<ProductionBatch[], ImportUploadedBatchesArgs>({
      query: ({ mappedBatches, uploadFileName }) => ({
        tag: 'ProductBatches',
        url: '/product-batches/production/import',
        method: 'POST',
        data: { mappedBatches, uploadFileName },
        mockResolver: () => {
          const batches = mappedBatches.map((mb) => buildProductionBatchFromUpload(mb, uploadFileName))
          addProductionBatches(batches)
          return mockDelay(batches)
        },
      }),
      invalidatesTags: [
        { type: 'ProductBatches', id: 'PRODUCTION_LIST' },
        { type: 'ProductBatches', id: 'PRODUCTION_KPIS' },
        { type: 'ProductBatches', id: 'SCAN_ANALYTICS' },
      ],
    }),
  }),
})

export const {
  useGetProductBatchesQuery,
  useGetProductBatchDetailQuery,
  useGetProductBatchKpisQuery,
  useGetProductionBatchesQuery,
  useGetProductionBatchDetailQuery,
  useGetProductionBatchKpisQuery,
  useGetScanAnalyticsRowsQuery,
  useImportUploadedBatchesMutation,
} = productBatchesApi
