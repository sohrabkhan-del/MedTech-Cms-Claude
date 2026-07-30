// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockMasterScanLogs,
  getMasterScanLogById,
  masterScanLogKpis,
  distributorOptions,
  dealerOptions,
  chemistOptions,
  batchOptions,
  productOptions,
} from '@/features/audit/mockMasterScanLogs'
import type { MasterScanLogEntry } from '@/features/audit/types/audit.types'
import { mockDelay } from '@/services/mockDelay'

// Master Scan Table Logs are read-only per product spec — this endpoint file
// only exposes list/detail/kpi/filter-option queries, no create/update/delete
// mutations.

export interface MasterScanLogFilterOptions {
  distributorOptions: string[]
  dealerOptions: string[]
  chemistOptions: string[]
  batchOptions: string[]
  productOptions: string[]
}

const masterScanLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMasterScanLogs: builder.query<MasterScanLogEntry[], void>({
      query: () => ({
        tag: 'MasterScanLogs',
        url: '/master-scan-logs',
        mockResolver: () => mockDelay(mockMasterScanLogs),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'MasterScanLogs' as const, id })),
              { type: 'MasterScanLogs' as const, id: 'LIST' },
            ]
          : [{ type: 'MasterScanLogs' as const, id: 'LIST' }],
    }),

    getMasterScanLogDetail: builder.query<MasterScanLogEntry | undefined, string>({
      query: (id) => ({
        tag: 'MasterScanLogs',
        url: `/master-scan-logs/${id}`,
        mockResolver: () => mockDelay(getMasterScanLogById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'MasterScanLogs', id }],
    }),

    getMasterScanLogKpis: builder.query<typeof masterScanLogKpis, void>({
      query: () => ({
        tag: 'MasterScanLogs',
        url: '/master-scan-logs/kpis',
        mockResolver: () => mockDelay(masterScanLogKpis),
      }),
      providesTags: [{ type: 'MasterScanLogs', id: 'KPIS' }],
    }),

    getMasterScanLogFilterOptions: builder.query<MasterScanLogFilterOptions, void>({
      query: () => ({
        tag: 'MasterScanLogs',
        url: '/master-scan-logs/filter-options',
        mockResolver: () =>
          mockDelay({
            distributorOptions,
            dealerOptions,
            chemistOptions,
            batchOptions,
            productOptions,
          }),
      }),
      providesTags: [{ type: 'MasterScanLogs', id: 'FILTER_OPTIONS' }],
    }),
  }),
})

export const {
  useGetMasterScanLogsQuery,
  useGetMasterScanLogDetailQuery,
  useGetMasterScanLogKpisQuery,
  useGetMasterScanLogFilterOptionsQuery,
} = masterScanLogsApi
