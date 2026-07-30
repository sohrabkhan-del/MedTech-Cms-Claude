// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockFactoryBatches,
  getBatchById,
  getContainerById,
  getBoxById,
  addFactoryBatch,
  buildNewBatchFromUpload,
  buildFactoryBatchFromBmrRow,
  factoryUploadKpis,
} from '@/features/inventoryManagement/mockFactoryUploads'
import type {
  FactoryBatch,
  BatchContainer,
  ContainerBox,
} from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { BmrBatchRow } from '@/types/batchUidUpload'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// factory/delivery upload API is available. `uploadFile` currently simulates
// parsing a CSV/Excel file by name only — swap for a real multipart upload.

export interface ContainerDetailArgs {
  batchId: string
  containerId: string
}

export interface BoxDetailArgs {
  batchId: string
  containerId: string
  boxId: string
}

export interface ImportBmrUploadArgs {
  batchRows: BmrBatchRow[]
  uploadFileName: string
  containerCountByBatch: Record<string, number>
}

const factoryUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFactoryBatches: builder.query<FactoryBatch[], void>({
      query: () => ({
        tag: 'FactoryUpload',
        url: '/factory-upload/batches',
        mockResolver: () => mockDelay(mockFactoryBatches),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'FactoryUpload' as const, id })),
              { type: 'FactoryUpload' as const, id: 'LIST' },
            ]
          : [{ type: 'FactoryUpload' as const, id: 'LIST' }],
    }),

    getFactoryBatchDetail: builder.query<FactoryBatch | undefined, string>({
      query: (batchId) => ({
        tag: 'FactoryUpload',
        url: `/factory-upload/batches/${batchId}`,
        mockResolver: () => mockDelay(getBatchById(batchId)),
      }),
      providesTags: (_result, _error, batchId) => [{ type: 'FactoryUpload', id: batchId }],
    }),

    getContainerDetail: builder.query<BatchContainer | undefined, ContainerDetailArgs>({
      query: ({ batchId, containerId }) => ({
        tag: 'FactoryUpload',
        url: `/factory-upload/batches/${batchId}/containers/${containerId}`,
        mockResolver: () => mockDelay(getContainerById(batchId, containerId)),
      }),
      providesTags: (_result, _error, { batchId, containerId }) => [
        { type: 'FactoryUpload', id: `${batchId}-container-${containerId}` },
      ],
    }),

    getBoxDetail: builder.query<ContainerBox | undefined, BoxDetailArgs>({
      query: ({ batchId, containerId, boxId }) => ({
        tag: 'FactoryUpload',
        url: `/factory-upload/batches/${batchId}/containers/${containerId}/boxes/${boxId}`,
        mockResolver: () => mockDelay(getBoxById(batchId, containerId, boxId)),
      }),
      providesTags: (_result, _error, { batchId, containerId, boxId }) => [
        { type: 'FactoryUpload', id: `${batchId}-container-${containerId}-box-${boxId}` },
      ],
    }),

    getFactoryUploadKpis: builder.query<typeof factoryUploadKpis, void>({
      query: () => ({
        tag: 'FactoryUpload',
        url: '/factory-upload/kpis',
        mockResolver: () => mockDelay(factoryUploadKpis),
      }),
      providesTags: [{ type: 'FactoryUpload', id: 'KPIS' }],
    }),

    /** Same shape used for both "Factory Inventory Upload" and "Delivery Upload" flows. */
    uploadFactoryFile: builder.mutation<FactoryBatch, { manifestFile: File; supportingFile: File }>({
      query: ({ manifestFile, supportingFile }) => ({
        tag: 'FactoryUpload',
        url: '/factory-upload/upload',
        method: 'POST',
        data: { manifestFile: manifestFile.name, supportingFile: supportingFile.name },
        mockResolver: () => {
          const batch = buildNewBatchFromUpload(`${manifestFile.name}+${supportingFile.name}`)
          addFactoryBatch(batch)
          return mockDelay(batch)
        },
      }),
      invalidatesTags: [{ type: 'FactoryUpload', id: 'LIST' }, { type: 'FactoryUpload', id: 'KPIS' }],
    }),

    /** Imports a Batch & UID Upload (BMR) result into the Active Product Registry Directory listing — one row per valid BMR batch, using its real uploaded fields. */
    importBmrUpload: builder.mutation<FactoryBatch[], ImportBmrUploadArgs>({
      query: ({ batchRows, uploadFileName, containerCountByBatch }) => ({
        tag: 'FactoryUpload',
        url: '/factory-upload/bmr-import',
        method: 'POST',
        data: { batchRows, uploadFileName, containerCountByBatch },
        mockResolver: () => {
          const batches = batchRows
            .filter((row) => row.isValid)
            .map((row) => buildFactoryBatchFromBmrRow(row, uploadFileName, containerCountByBatch[row.batchNumber] ?? 0))
          batches.forEach(addFactoryBatch)
          return mockDelay(batches)
        },
      }),
      invalidatesTags: [{ type: 'FactoryUpload', id: 'LIST' }, { type: 'FactoryUpload', id: 'KPIS' }],
    }),
  }),
})

export const {
  useGetFactoryBatchesQuery,
  useGetFactoryBatchDetailQuery,
  useGetContainerDetailQuery,
  useGetBoxDetailQuery,
  useGetFactoryUploadKpisQuery,
  useUploadFactoryFileMutation,
  useImportBmrUploadMutation,
} = factoryUploadApi
