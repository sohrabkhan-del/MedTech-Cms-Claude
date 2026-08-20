import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type {
  DispatchInvoice,
  DispatchLineItem,
  DispatchUploadPreview,
  DispatchUploadRow,
} from '@/types/distributorUpload'

// ---------------------------------------------------------------------------
// GET /distributors/invoice-uploads — list
// GET /distributors/invoice-uploads/:id — detail (with items)
// POST /distributors/invoice-uploads — create
// ---------------------------------------------------------------------------

interface InvoiceUploadRowApiItem {
  id: string
  uploadId: string
  distributorId: string
  srNo: number
  itemCode: string
  itemName: string
  cartonNo: number | string
  cartonWeight: number
  dispatchQty: number
  status: string
  createdAt: string
}

interface InvoiceUploadApiItem {
  id: string
  referenceId: string
  distributorId: string
  customerName: string
  invoiceNo: string
  transporter: string
  totalBoxQty: number
  vehicleNo: string | null
  date: string
  totalRows: number
  items: InvoiceUploadRowApiItem[] | null
  createdAt: string
  updatedAt: string
}

interface PagedApiResponse<T> {
  success: boolean
  data: {
    items: T[]
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

function mapLineItem(item: InvoiceUploadRowApiItem): DispatchLineItem {
  return {
    id: item.id,
    srNo: item.srNo,
    itemCode: item.itemCode,
    itemName: item.itemName,
    cartonNo: Number(item.cartonNo) || 0,
    cartonWeight: item.cartonWeight,
    dispatchQty: item.dispatchQty,
  }
}

function mapInvoiceUpload(item: InvoiceUploadApiItem): DispatchInvoice {
  return {
    id: item.id,
    distributorId: item.distributorId,
    invoiceNo: item.invoiceNo,
    customerName: item.customerName,
    transporter: item.transporter,
    vehicleNo: item.vehicleNo ?? '',
    totalBoxQty: item.totalBoxQty,
    date: new Date(item.date).toLocaleDateString('en-IN'),
    formatNo: '',
    revNo: '',
    revDate: '',
    uploadFile: '',
    uploadedDate: item.createdAt,
    lineItems: (item.items ?? []).map(mapLineItem),
  }
}

export interface ConfirmImportArgs {
  rows: DispatchUploadRow[]
  uploadFileName: string
  invoiceMeta: DispatchInvoiceMeta
}

type ApiDispatchPreviewRow = Partial<DispatchUploadRow> & {
  index?: number
  rowNo?: number
  action?: string
  status?: string
  valid?: boolean
  reason?: string
  message?: string
  reasons?: string[]
}

type ApiDispatchPreviewData = Omit<Partial<DispatchUploadPreview>, 'rows'> & {
  rows?: ApiDispatchPreviewRow[]
  items?: ApiDispatchPreviewRow[]
  totalRows?: number
  hasDuplicates?: boolean
  duplicateRows?: ApiDispatchPreviewRow[]
  existingDuplicates?: unknown[]
  preview?: {
    customerName?: string
    invoiceNo?: string
    transporter?: string
    totalBoxQty?: number
    vehicleNo?: string
    date?: string
    rows?: ApiDispatchPreviewRow[]
  }
}

function duplicateKey(row: ApiDispatchPreviewRow): string {
  if (row.index !== undefined) return `index:${row.index}`
  if (row.srNo !== undefined) return `srNo:${row.srNo}`
  return `carton:${row.cartonNo}`
}

function duplicateReason(row: ApiDispatchPreviewRow): string | undefined {
  const reasons = row.reasons?.length ? row.reasons : undefined
  if (!reasons) return undefined
  return reasons
    .map((reason) =>
      reason
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    )
    .join(', ')
}

function previewStatus(
  row: ApiDispatchPreviewRow,
  isDuplicate: boolean,
): DispatchUploadRow['previewStatus'] {
  const status = String(row.action ?? row.status ?? '')
    .trim()
    .toLowerCase()
  const reasons = row.reasons?.join(' ').toLowerCase() ?? ''
  if (
    isDuplicate ||
    status.includes('duplicate') ||
    reasons.includes('duplicate')
  )
    return 'duplicate'
  if (
    status.includes('invalid') ||
    status.includes('error') ||
    reasons.includes('invalid')
  )
    return 'invalid'
  if (status.includes('skip') || status.includes('skipped')) return 'skip'
  return 'add'
}

export interface DispatchInvoicesQueryParams {
  regionId?: string
  preset?: string
  startDate?: string
  endDate?: string
}

const distributorUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /distributors/invoice-uploads — every dispatch invoice upload. */
    getDispatchInvoices: builder.query<
      DispatchInvoice[],
      DispatchInvoicesQueryParams | void
    >({
      query: (params) => ({
        tag: 'DistributorUpload',
        url: '/distributors/invoice-uploads',
        params: {
          page: 1,
          limit: 50,
          regionId: params?.regionId || undefined,
          preset: params?.preset || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => mockDelay([]),
      }),
      transformResponse: (response: PagedApiResponse<InvoiceUploadApiItem>) =>
        response.data.items.map(mapInvoiceUpload),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'DistributorUpload' as const,
                id,
              })),
              { type: 'DistributorUpload' as const, id: 'LIST' },
            ]
          : [{ type: 'DistributorUpload' as const, id: 'LIST' }],
    }),

    /** GET /distributors/invoice-uploads/:id — one dispatch invoice, with its item rows. */
    getDispatchInvoiceDetail: builder.query<
      DispatchInvoice | undefined,
      string
    >({
      query: (id) => ({
        tag: 'DistributorUpload',
        url: `/distributors/invoice-uploads/${id}`,
        mockResolver: () => mockDelay(undefined),
      }),
      transformResponse: (response: {
        success: boolean
        data: InvoiceUploadApiItem
      }) => mapInvoiceUpload(response.data),
      providesTags: (_result, _error, id) => [
        { type: 'DistributorUpload', id },
      ],
    }),

    /** POST /distributors/invoice-uploads — creates a new dispatch invoice upload. */
    previewImport: builder.mutation<DispatchUploadPreview, ConfirmImportArgs>({
      query: ({ rows, invoiceMeta }) => ({
        tag: 'DistributorUpload',
        url: '/distributors/invoice-uploads/preview',
        method: 'POST',
        data: {
          customerName: invoiceMeta.customerName,
          invoiceNo: invoiceMeta.invoiceNo,
          transporter: invoiceMeta.transporter,
          totalBoxQty: invoiceMeta.totalBoxQty,
          vehicleNo: invoiceMeta.vehicleNo,
          date: invoiceMeta.date,
          rows: rows.map((row) => ({
            srNo: row.srNo,
            itemCode: row.itemCode,
            itemName: row.itemName,
            cartonNo: row.cartonNo,
            cartonWeight: row.cartonWeight,
            dispatchQty: row.dispatchQty,
          })),
        },
        mockResolver: () =>
          Promise.reject(
            new Error(
              'Distributor upload preview has no mock mode — real API only.',
            ),
          ),
      }),
      transformResponse: (
        response:
          | {
              success: boolean
              data: Partial<DispatchUploadPreview> & {
                items?: ApiDispatchPreviewRow[]
              }
            }
          | Partial<DispatchUploadPreview>
          | ApiDispatchPreviewRow[],
      ): DispatchUploadPreview => {
        const data: ApiDispatchPreviewData = Array.isArray(response)
          ? { rows: response }
          : 'data' in response
            ? response.data
            : (response as ApiDispatchPreviewData)
        const rawRows =
          data.preview?.rows ??
          data.rows ??
          data.items ??
          data.duplicateRows ??
          []
        const duplicateRows = data.duplicateRows ?? []
        const duplicateByKey = new Map(
          duplicateRows.map((row) => [duplicateKey(row), row]),
        )
        const rows = rawRows.map(
          (row: ApiDispatchPreviewRow, index: number) => {
            const duplicate = duplicateByKey.get(duplicateKey(row))
            const status = previewStatus(duplicate ?? row, !!duplicate)
            const isValid =
              status === 'add' ? (row.isValid ?? row.valid ?? true) : false
            return {
              id: row.id ?? `dispatch-preview-row-${index + 1}`,
              srNo: row.srNo ?? row.rowNo ?? index + 1,
              itemCode: String(row.itemCode ?? ''),
              itemName: String(row.itemName ?? ''),
              cartonNo: Number(row.cartonNo) || 0,
              cartonWeight: Number(row.cartonWeight) || 0,
              dispatchQty: Number(row.dispatchQty) || 0,
              isValid,
              previewStatus: status,
              validationNote:
                duplicateReason(duplicate ?? row) ??
                row.validationNote ??
                row.reason ??
                row.message ??
                (status === 'duplicate'
                  ? 'Duplicate invoice/carton already exists'
                  : isValid
                    ? undefined
                    : 'Will not add'),
            }
          },
        )
        const invalidRows = rows.filter((row) => !row.isValid).length
        const duplicateCartons =
          data.summary?.duplicateCartons ??
          rows.filter((row) => row.previewStatus === 'duplicate').length
        const invalidWeights =
          data.summary?.invalidWeights ??
          rows.filter((row) =>
            row.validationNote?.toLowerCase().includes('weight'),
          ).length

        return {
          rows,
          summary: {
            totalRows: data.summary?.totalRows ?? rows.length,
            validRows:
              data.summary?.validRows ??
              rows.filter((row) => row.isValid).length,
            duplicateCartons,
            invalidWeights,
            skippedRows:
              data.summary?.skippedRows ??
              Math.max(invalidRows - duplicateCartons - invalidWeights, 0),
            existingDuplicateInvoices: data.existingDuplicates?.length ?? 0,
          },
        }
      },
    }),

    /** POST /distributors/invoice-uploads — creates a new dispatch invoice upload. */
    confirmImport: builder.mutation<DispatchInvoice, ConfirmImportArgs>({
      query: ({ rows, invoiceMeta }) => ({
        tag: 'DistributorUpload',
        url: '/distributors/invoice-uploads',
        method: 'POST',
        data: {
          customerName: invoiceMeta.customerName,
          invoiceNo: invoiceMeta.invoiceNo,
          transporter: invoiceMeta.transporter,
          totalBoxQty: invoiceMeta.totalBoxQty,
          vehicleNo: invoiceMeta.vehicleNo,
          date: invoiceMeta.date,
          rows: rows
            .filter((row) => row.isValid)
            .map((row) => ({
              srNo: row.srNo,
              itemCode: row.itemCode,
              itemName: row.itemName,
              cartonNo: row.cartonNo,
              cartonWeight: row.cartonWeight,
              dispatchQty: row.dispatchQty,
              status: 'Valid',
            })),
        },
        mockResolver: () =>
          Promise.reject(
            new Error('Distributor upload has no mock mode — real API only.'),
          ),
      }),
      transformResponse: (response: {
        success: boolean
        data: InvoiceUploadApiItem
      }) => mapInvoiceUpload(response.data),
      invalidatesTags: [{ type: 'DistributorUpload', id: 'LIST' }],
    }),

    /** DELETE /distributors/:id — deletes a distributor. */
    deleteDistributor: builder.mutation<void, string>({
      query: (distributorId) => ({
        tag: 'DistributorUpload',
        url: `/distributors/${distributorId}`,
        method: 'DELETE',
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'DistributorUpload', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetDispatchInvoicesQuery,
  useGetDispatchInvoiceDetailQuery,
  usePreviewImportMutation,
  useConfirmImportMutation,
  useDeleteDistributorMutation,
} = distributorUploadApi
