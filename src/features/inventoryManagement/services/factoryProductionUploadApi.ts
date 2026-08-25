import { baseApi } from '@/store/api/baseApi'
import type {
  FactoryProductionUploadBatch,
  FactoryProductionUploadBatchDetail,
  FactoryProductionUploadBatchList,
  FactoryProductionUploadBatchSummary,
  FactoryProductionUploadPreview,
  FactoryProductionUploadRow,
  FactoryProductionUploadRowRecord,
} from '@/types/factoryProductionUpload'

export interface UploadFactoryProductionRowsArgs {
  rows: FactoryProductionUploadRow[]
  fileName?: string
}

/** The upload API expects PascalCase keys; internal state/UI stay camelCase. */
function toApiRow(row: FactoryProductionUploadRow) {
  return {
    ProductCode: row.productCode,
    BatchNo: row.batchNo,
    ProductionPlanNumber: row.productionPlanNumber,
    BatchIssuedDate: row.batchIssuedDate,
    BatchIssuedByName: row.batchIssuedByName,
    Month: row.month,
    Qty: row.qty,
    SampleQty: row.sampleQty,
    PlugType: row.plugType,
    Domestic: row.domestic,
    Export: row.export,
    AssyLineNo: row.assyLineNo,
    BatchCompletedDate: row.batchCompletedDate,
    ProducedQty: row.producedQty,
    StartSerialNumber: row.startSerialNumber,
    EndSerialNumber: row.endSerialNumber,
    MasterCartonStartNo: row.masterCartonStartNo,
    MasterCartonEndNo: row.masterCartonEndNo,
  }
}

export interface FactoryProductionUploadRowsQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
  /** Scope the listing to a single upload batch (the upload id). Omit for all batches. */
  uploadBatchId?: string
}

export interface FactoryProductionUploadBatchesQueryParams {
  page?: number
  limit?: number
  search?: string
  /** ISO date (YYYY-MM-DD) — include batches uploaded on/after this day. */
  startDate?: string
  /** ISO date (YYYY-MM-DD) — include batches uploaded on/before this day. */
  endDate?: string
}

interface FactoryProductionUploadRowsListResponse {
  items: FactoryProductionUploadRowRecord[]
  totalItems: number
}

type ApiPreviewRow = Partial<FactoryProductionUploadRow> & {
  id?: string
  index?: number
  rowNo?: number
  rowNumber?: number
  action?: string
  status?: string
  isValid?: boolean
  valid?: boolean
  reason?: string
  message?: string
  validationNote?: string
  reasons?: string[]
}

type ApiFactoryPreviewData = Omit<
  Partial<FactoryProductionUploadPreview>,
  'rows' | 'duplicateRows'
> & {
  rows?: ApiPreviewRow[]
  items?: ApiPreviewRow[]
  duplicateRows?: ApiPreviewRow[] | number
  preview?: {
    rows?: ApiPreviewRow[]
  }
  hasDuplicates?: boolean
}

function previewRowKey(row: ApiPreviewRow): string {
  if (row.index !== undefined) return `index:${row.index}`
  if (row.rowNo !== undefined) return `rowNo:${row.rowNo}`
  if (row.rowNumber !== undefined) return `rowNumber:${row.rowNumber}`
  return `${row.productCode ?? ''}:${row.batchNo ?? ''}`
}

function formatReason(reason: string): string {
  return reason
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function previewReason(row: ApiPreviewRow): string | undefined {
  if (row.reason) return row.reason
  if (row.message) return row.message
  if (row.validationNote) return row.validationNote
  if (row.reasons?.length) return row.reasons.map(formatReason).join(', ')
  return undefined
}

function normalizePreviewAction(
  row: ApiPreviewRow,
  isDuplicate = false,
): FactoryProductionUploadPreview['rows'][number]['action'] {
  const action = String(row.action ?? row.status ?? '')
    .trim()
    .toLowerCase()
  const reasons = row.reasons?.join(' ').toLowerCase() ?? ''
  if (
    isDuplicate ||
    action.includes('duplicate') ||
    reasons.includes('duplicate')
  )
    return 'duplicate'
  if (action.includes('skip') || action.includes('exist')) return 'skip'
  if (
    action.includes('invalid') ||
    action.includes('error') ||
    reasons.includes('invalid')
  )
    return 'invalid'
  return row.isValid === false || row.valid === false ? 'invalid' : 'add'
}

function mapFactoryPreviewRow(
  row: ApiPreviewRow,
  index: number,
  duplicate?: ApiPreviewRow,
): FactoryProductionUploadPreview['rows'][number] {
  const source = duplicate ?? row
  const action = normalizePreviewAction(source, !!duplicate)
  return {
    id: row.id ?? `preview-row-${index + 1}`,
    rowNo: row.rowNo ?? row.rowNumber ?? index + 1,
    productCode: String(row.productCode ?? ''),
    batchNo: String(row.batchNo ?? ''),
    productionPlanNumber: String(row.productionPlanNumber ?? ''),
    batchIssuedDate: String(row.batchIssuedDate ?? ''),
    batchIssuedByName: String(row.batchIssuedByName ?? ''),
    month: String(row.month ?? ''),
    qty: Number(row.qty) || 0,
    sampleQty: Number(row.sampleQty) || 0,
    plugType: String(row.plugType ?? ''),
    domestic: Number(row.domestic) || 0,
    export: Number(row.export) || 0,
    assyLineNo: String(row.assyLineNo ?? ''),
    batchCompletedDate: String(row.batchCompletedDate ?? ''),
    producedQty: Number(row.producedQty) || 0,
    startSerialNumber: Number(row.startSerialNumber) || 0,
    endSerialNumber: Number(row.endSerialNumber) || 0,
    masterCartonStartNo: Number(row.masterCartonStartNo) || 0,
    masterCartonEndNo: Number(row.masterCartonEndNo) || 0,
    action,
    isValid: action === 'add',
    reason:
      previewReason(source) ??
      (action === 'duplicate'
        ? 'Duplicate batch/product already exists'
        : action === 'add'
          ? undefined
          : 'Will not add'),
  }
}

function mapFactoryPreviewResponse(
  response:
    | {
        success: boolean
        data: Partial<FactoryProductionUploadPreview> & {
          items?: ApiPreviewRow[]
        }
      }
    | Partial<FactoryProductionUploadPreview>
    | ApiPreviewRow[],
): FactoryProductionUploadPreview {
  const data: ApiFactoryPreviewData = Array.isArray(response)
    ? { rows: response }
    : 'data' in response
      ? response.data
      : (response as ApiFactoryPreviewData)
  const duplicateRows = Array.isArray(data.duplicateRows)
    ? data.duplicateRows
    : []
  const rawRows = (data.preview?.rows ??
    data.rows ??
    data.items ??
    duplicateRows) as ApiPreviewRow[]
  const duplicateByKey = new Map(
    duplicateRows.map((row) => [previewRowKey(row), row]),
  )
  const rows = rawRows.map((row, index) =>
    mapFactoryPreviewRow(row, index, duplicateByKey.get(previewRowKey(row))),
  )
  const addableRows =
    data.addableRows ?? rows.filter((row) => row.action === 'add').length
  const duplicateRowCount =
    typeof data.duplicateRows === 'number'
      ? data.duplicateRows
      : rows.filter((row) => row.action === 'duplicate').length
  const invalidRows =
    data.invalidRows ?? rows.filter((row) => row.action === 'invalid').length
  const skippedRows =
    data.skippedRows ?? rows.filter((row) => row.action === 'skip').length

  return {
    rows,
    totalRows: data.totalRows ?? rows.length,
    addableRows,
    duplicateRows: duplicateRowCount,
    invalidRows,
    skippedRows,
  }
}

export interface FactoryInventoryUploadKpis {
  totalBatches: number
  totalUploads: number
}

const factoryProductionUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /analytics-cards/factory-inventory-upload — stat card totals for the
     *  Active Product Registry Directory (total batches, total uploaded rows). */
    getFactoryInventoryUploadKpis: builder.query<
      FactoryInventoryUploadKpis,
      void
    >({
      query: () => ({
        tag: 'FactoryProductionUpload',
        url: '/analytics-cards/factory-inventory-upload',
        mockResolver: () => {
          throw new Error(
            'Factory production upload has no mock mode — real API only.',
          )
        },
      }),
      transformResponse: (
        response:
          | { success: boolean; data: FactoryInventoryUploadKpis }
          | FactoryInventoryUploadKpis,
      ): FactoryInventoryUploadKpis =>
        'data' in response ? response.data : response,
      providesTags: [{ type: 'FactoryProductionUpload', id: 'KPIS' }],
    }),

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
          uploadBatchId: params?.uploadBatchId || undefined,
        },
        mockResolver: () => {
          throw new Error(
            'Factory production upload has no mock mode — real API only.',
          )
        },
      }),
      transformResponse: (
        response:
          | {
              success: boolean
              data: {
                items: FactoryProductionUploadRowRecord[]
                totalItems: number
              }
            }
          | FactoryProductionUploadRowsListResponse
          | FactoryProductionUploadRowRecord[],
      ): FactoryProductionUploadRowsListResponse => {
        if (Array.isArray(response)) {
          return { items: response, totalItems: response.length }
        }
        if ('data' in response) {
          return {
            items: response.data.items,
            totalItems: response.data.totalItems,
          }
        }
        return response
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((row) => ({
                type: 'FactoryProductionUpload' as const,
                id: row.id,
              })),
              { type: 'FactoryProductionUpload' as const, id: 'LIST' },
            ]
          : [{ type: 'FactoryProductionUpload' as const, id: 'LIST' }],
    }),

    /** POST /products/upload — persists the batch of rows exactly as parsed from the .xls file. */
    previewFactoryProductionRows: builder.mutation<
      FactoryProductionUploadPreview,
      UploadFactoryProductionRowsArgs
    >({
      query: ({ rows }) => ({
        tag: 'FactoryProductionUpload',
        url: '/products/upload/preview',
        method: 'POST',
        data: { rows: rows.map(toApiRow) },
        mockResolver: () => {
          throw new Error(
            'Factory production upload preview has no mock mode — real API only.',
          )
        },
      }),
      transformResponse: mapFactoryPreviewResponse,
    }),

    /** POST /products/upload — persists the batch of rows exactly as parsed from the .xls file. */
    uploadFactoryProductionRows: builder.mutation<
      FactoryProductionUploadBatch,
      UploadFactoryProductionRowsArgs
    >({
      query: ({ rows, fileName }) => ({
        tag: 'FactoryProductionUpload',
        // Use external ingestion endpoint — absolute URL so axios/fetch will
        // call it directly instead of the app's baseApi host.
        url: 'http://ec2-16-171-110-170.eu-north-1.compute.amazonaws.com:3336/api/v1/products/upload',
        method: 'POST',
        data: { rows: rows.map(toApiRow), fileName },
        mockResolver: () => {
          throw new Error(
            'Factory production upload has no mock mode — real API only.',
          )
        },
      }),
      transformResponse: (
        response:
          | { success: boolean; data: FactoryProductionUploadBatch }
          | FactoryProductionUploadBatch,
      ): FactoryProductionUploadBatch =>
        'data' in response ? response.data : response,
      invalidatesTags: [{ type: 'FactoryProductionUpload', id: 'LIST' }],
    }),

    /** GET /products/upload/{id} — the upload batch record (with its rows embedded) for this upload event. */
    getFactoryProductionUploadBatch: builder.query<
      FactoryProductionUploadBatchDetail,
      string
    >({
      query: (id) => ({
        tag: 'FactoryProductionUpload',
        url: `/products/upload/${id}`,
        mockResolver: () => {
          throw new Error(
            'Factory production upload has no mock mode — real API only.',
          )
        },
      }),
      transformResponse: (
        response:
          | { success: boolean; data: FactoryProductionUploadBatchDetail }
          | FactoryProductionUploadBatchDetail,
      ): FactoryProductionUploadBatchDetail =>
        'data' in response ? response.data : response,
      providesTags: (_result, _error, id) => [
        { type: 'FactoryProductionUpload', id },
      ],
    }),

    /** GET /products/upload?page&limit&startDate&endDate — paginated list of every upload batch (headers only, no rows). */
    getFactoryProductionUploadBatches: builder.query<
      FactoryProductionUploadBatchList,
      FactoryProductionUploadBatchesQueryParams | void
    >({
      query: (params) => ({
        tag: 'FactoryProductionUpload',
        url: '/products/upload',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          search: params?.search || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => {
          throw new Error(
            'Factory production upload has no mock mode — real API only.',
          )
        },
      }),
      transformResponse: (
        response:
          | {
              success: boolean
              data: {
                data: FactoryProductionUploadBatchSummary[]
                total: number
                page: number
                pageSize: number
                totalPages: number
              }
            }
          | {
              data: FactoryProductionUploadBatchSummary[]
              total: number
              page: number
              pageSize: number
              totalPages: number
            },
      ): FactoryProductionUploadBatchList => {
        const payload = 'success' in response ? response.data : response
        return {
          items: payload.data ?? [],
          total: payload.total ?? 0,
          page: payload.page ?? 1,
          pageSize: payload.pageSize ?? 0,
          totalPages: payload.totalPages ?? 0,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((batch) => ({
                type: 'FactoryProductionUpload' as const,
                id: batch.id,
              })),
              { type: 'FactoryProductionUpload' as const, id: 'UPLOADS' },
            ]
          : [{ type: 'FactoryProductionUpload' as const, id: 'UPLOADS' }],
    }),

    /** DELETE /products/upload/{id} — removes the whole upload batch and every product/row imported from it. */
    deleteFactoryProductionUploadBatch: builder.mutation<
      { success: boolean },
      string
    >({
      query: (id) => ({
        tag: 'FactoryProductionUpload',
        url: `/products/upload/${id}`,
        method: 'DELETE',
        mockResolver: () => {
          throw new Error(
            'Factory production upload has no mock mode — real API only.',
          )
        },
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'FactoryProductionUpload', id },
        { type: 'FactoryProductionUpload', id: 'UPLOADS' },
        { type: 'FactoryProductionUpload', id: 'LIST' },
        { type: 'FactoryProductionUpload', id: 'KPIS' },
      ],
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
          throw new Error(
            'Factory production upload has no mock mode — real API only.',
          )
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
          throw new Error(
            'Factory production upload has no mock mode — real API only.',
          )
        },
      }),
      providesTags: (_result, _error, batchNo) => [
        { type: 'FactoryProductionUpload', id: `batch-${batchNo}` },
      ],
    }),
  }),
})

export const {
  usePreviewFactoryProductionRowsMutation,
  useUploadFactoryProductionRowsMutation,
  useGetFactoryProductionUploadBatchQuery,
  useGetFactoryProductionUploadBatchesQuery,
  useDeleteFactoryProductionUploadBatchMutation,
  useGetFactoryProductionUploadRowsByBatchQuery,
  useGetFactoryProductionBatchByNumberQuery,
  useGetFactoryProductionUploadRowsQuery,
  useGetFactoryInventoryUploadKpisQuery,
} = factoryProductionUploadApi
