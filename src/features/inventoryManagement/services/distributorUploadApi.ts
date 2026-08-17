import { baseApi } from '@/store/api/baseApi'
import { mockDelay } from '@/services/mockDelay'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type { DispatchInvoice, DispatchLineItem, DispatchUploadRow } from '@/types/distributorUpload'

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

export interface DispatchInvoicesQueryParams {
  regionId?: string
  preset?: string
  startDate?: string
  endDate?: string
}

const distributorUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /distributors/invoice-uploads — every dispatch invoice upload. */
    getDispatchInvoices: builder.query<DispatchInvoice[], DispatchInvoicesQueryParams | void>({
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
              ...result.map(({ id }) => ({ type: 'DistributorUpload' as const, id })),
              { type: 'DistributorUpload' as const, id: 'LIST' },
            ]
          : [{ type: 'DistributorUpload' as const, id: 'LIST' }],
    }),

    /** GET /distributors/invoice-uploads/:id — one dispatch invoice, with its item rows. */
    getDispatchInvoiceDetail: builder.query<DispatchInvoice | undefined, string>({
      query: (id) => ({
        tag: 'DistributorUpload',
        url: `/distributors/invoice-uploads/${id}`,
        mockResolver: () => mockDelay(undefined),
      }),
      transformResponse: (response: { success: boolean; data: InvoiceUploadApiItem }) =>
        mapInvoiceUpload(response.data),
      providesTags: (_result, _error, id) => [{ type: 'DistributorUpload', id }],
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
        mockResolver: () => Promise.reject(new Error('Distributor upload has no mock mode — real API only.')),
      }),
      transformResponse: (response: { success: boolean; data: InvoiceUploadApiItem }) =>
        mapInvoiceUpload(response.data),
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
  useConfirmImportMutation,
  useDeleteDistributorMutation,
} = distributorUploadApi
