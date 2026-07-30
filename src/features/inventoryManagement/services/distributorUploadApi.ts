// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  addDispatchInvoice,
  getDispatchInvoiceById,
  getMockDispatchInvoices,
} from '@/features/inventoryManagement/mockDistributorUpload'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type { DispatchInvoice, DispatchUploadRow } from '@/types/distributorUpload'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// distributor upload API is available.

export interface ConfirmImportArgs {
  rows: DispatchUploadRow[]
  uploadFileName: string
  invoiceMeta: DispatchInvoiceMeta
}

const distributorUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDispatchInvoices: builder.query<DispatchInvoice[], void>({
      query: () => ({
        tag: 'DistributorUpload',
        url: '/distributor-upload/invoices',
        mockResolver: () => mockDelay(getMockDispatchInvoices()),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'DistributorUpload' as const, id })),
              { type: 'DistributorUpload' as const, id: 'LIST' },
            ]
          : [{ type: 'DistributorUpload' as const, id: 'LIST' }],
    }),

    getDispatchInvoiceDetail: builder.query<DispatchInvoice | undefined, string>({
      query: (id) => ({
        tag: 'DistributorUpload',
        url: `/distributor-upload/invoices/${id}`,
        mockResolver: () => mockDelay(getDispatchInvoiceById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'DistributorUpload', id }],
    }),

    confirmImport: builder.mutation<DispatchInvoice, ConfirmImportArgs>({
      query: ({ rows, uploadFileName, invoiceMeta }) => ({
        tag: 'DistributorUpload',
        url: '/distributor-upload/invoices',
        method: 'POST',
        data: { rows, uploadFileName, invoiceMeta },
        mockResolver: () => mockDelay(addDispatchInvoice(rows, uploadFileName, invoiceMeta), 700),
      }),
      invalidatesTags: [{ type: 'DistributorUpload', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetDispatchInvoicesQuery,
  useGetDispatchInvoiceDetailQuery,
  useConfirmImportMutation,
} = distributorUploadApi
