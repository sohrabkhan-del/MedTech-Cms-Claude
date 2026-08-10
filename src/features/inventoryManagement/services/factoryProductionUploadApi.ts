import { baseApi } from '@/store/api/baseApi'
import type {
  FactoryProductionUploadBatch,
  FactoryProductionUploadRow,
  FactoryProductionUploadRowRecord,
} from '@/types/factoryProductionUpload'

export interface UploadFactoryProductionRowsArgs {
  rows: FactoryProductionUploadRow[]
}

export interface FactoryProductionUploadRowsQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

interface FactoryProductionUploadRowsListResponse {
  items: FactoryProductionUploadRowRecord[]
  totalItems: number
}

const factoryProductionUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /products/upload-rows — full listing of uploaded rows across every batch,
     *  driving the Active Product Registry Directory table (search/sort/filter/paginate). */
    getFactoryProductionUploadRows: builder.query<
      FactoryProductionUploadRowsListResponse,
      FactoryProductionUploadRowsQueryParams | void
    >({
      query: (params) => ({
        tag: 'FactoryProductionUpload',
        url: '/products/upload-rows',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search || undefined,
          sortBy: params?.sortBy || undefined,
          sortOrder: params?.sortOrder ?? 'desc',
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => {
          throw new Error('Factory production upload has no mock mode — real API only.')
        },
      }),
      transformResponse: (
        response:
          | { success: boolean; data: { items: FactoryProductionUploadRowRecord[]; totalItems: number } }
          | FactoryProductionUploadRowsListResponse
          | FactoryProductionUploadRowRecord[],
      ): FactoryProductionUploadRowsListResponse => {
        if (Array.isArray(response)) {
          return { items: response, totalItems: response.length }
        }
        if ('data' in response) {
          return { items: response.data.items, totalItems: response.data.totalItems }
        }
        return response
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((row) => ({ type: 'FactoryProductionUpload' as const, id: row.id })),
              { type: 'FactoryProductionUpload' as const, id: 'LIST' },
            ]
          : [{ type: 'FactoryProductionUpload' as const, id: 'LIST' }],
    }),

    /** POST /products/upload — persists the batch of rows exactly as parsed from the .xls file. */
    uploadFactoryProductionRows: builder.mutation<
      FactoryProductionUploadBatch,
      UploadFactoryProductionRowsArgs
    >({
      query: ({ rows }) => ({
        tag: 'FactoryProductionUpload',
        url: '/products/upload',
        method: 'POST',
        data: { rows },
        mockResolver: () => {
          throw new Error('Factory production upload has no mock mode — real API only.')
        },
      }),
      invalidatesTags: [{ type: 'FactoryProductionUpload', id: 'LIST' }],
    }),

    /** GET /products/upload/{id} — the upload batch record created for this upload event. */
    getFactoryProductionUploadBatch: builder.query<FactoryProductionUploadBatch, string>({
      query: (id) => ({
        tag: 'FactoryProductionUpload',
        url: `/products/upload/${id}`,
        mockResolver: () => {
          throw new Error('Factory production upload has no mock mode — real API only.')
        },
      }),
      providesTags: (_result, _error, id) => [{ type: 'FactoryProductionUpload', id }],
    }),

    /** GET /products/upload-rows/batch/{batchNo} — every uploaded row for a given batch number. */
    getFactoryProductionUploadRowsByBatch: builder.query<
      FactoryProductionUploadRowRecord[],
      string
    >({
      query: (batchNo) => ({
        tag: 'FactoryProductionUpload',
        url: `/products/upload-rows/batch/${batchNo}`,
        mockResolver: () => {
          throw new Error('Factory production upload has no mock mode — real API only.')
        },
      }),
      providesTags: (_result, _error, batchNo) => [
        { type: 'FactoryProductionUpload', id: `rows-${batchNo}` },
      ],
    }),

    /** GET /products/batch/{batchNo} — aggregated batch info by batch number. */
    getFactoryProductionBatchByNumber: builder.query<unknown, string>({
      query: (batchNo) => ({
        tag: 'FactoryProductionUpload',
        url: `/products/batch/${batchNo}`,
        mockResolver: () => {
          throw new Error('Factory production upload has no mock mode — real API only.')
        },
      }),
      providesTags: (_result, _error, batchNo) => [
        { type: 'FactoryProductionUpload', id: `batch-${batchNo}` },
      ],
    }),
  }),
})

export const {
  useUploadFactoryProductionRowsMutation,
  useGetFactoryProductionUploadBatchQuery,
  useGetFactoryProductionUploadRowsByBatchQuery,
  useGetFactoryProductionBatchByNumberQuery,
  useGetFactoryProductionUploadRowsQuery,
} = factoryProductionUploadApi
