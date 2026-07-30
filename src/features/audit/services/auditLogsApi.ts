// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockAuditLogs,
  getAuditLogById,
  auditLogKpis,
  auditModuleOptions,
  auditActionOptions,
  auditEntityOptions,
  auditUserRoleOptions,
} from '@/features/audit/mockAuditLogs'
import type { AuditLogEntry, AuditActionType, AuditEntityType, AuditModule, AuditUserRole } from '@/features/audit/types/audit.types'
import { mockDelay } from '@/services/mockDelay'

// Audit Logs are read-only per product spec — this endpoint file only exposes
// list/detail/kpi/filter-option queries, no create/update/delete mutations.

export interface AuditLogFilterOptions {
  moduleOptions: AuditModule[]
  actionOptions: AuditActionType[]
  entityOptions: AuditEntityType[]
  userRoleOptions: AuditUserRole[]
}

const auditLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogEntry[], void>({
      query: () => ({ tag: 'AuditLogs', url: '/audit-logs', mockResolver: () => mockDelay(mockAuditLogs) }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AuditLogs' as const, id })),
              { type: 'AuditLogs' as const, id: 'LIST' },
            ]
          : [{ type: 'AuditLogs' as const, id: 'LIST' }],
    }),

    getAuditLogDetail: builder.query<AuditLogEntry | undefined, string>({
      query: (id) => ({
        tag: 'AuditLogs',
        url: `/audit-logs/${id}`,
        mockResolver: () => mockDelay(getAuditLogById(id)),
      }),
      providesTags: (_result, _error, id) => [{ type: 'AuditLogs', id }],
    }),

    getAuditLogKpis: builder.query<typeof auditLogKpis, void>({
      query: () => ({ tag: 'AuditLogs', url: '/audit-logs/kpis', mockResolver: () => mockDelay(auditLogKpis) }),
      providesTags: [{ type: 'AuditLogs', id: 'KPIS' }],
    }),

    getAuditLogFilterOptions: builder.query<AuditLogFilterOptions, void>({
      query: () => ({
        tag: 'AuditLogs',
        url: '/audit-logs/filter-options',
        mockResolver: () =>
          mockDelay({
            moduleOptions: auditModuleOptions,
            actionOptions: auditActionOptions,
            entityOptions: auditEntityOptions,
            userRoleOptions: auditUserRoleOptions,
          }),
      }),
      providesTags: [{ type: 'AuditLogs', id: 'FILTER_OPTIONS' }],
    }),
  }),
})

export const {
  useGetAuditLogsQuery,
  useGetAuditLogDetailQuery,
  useGetAuditLogKpisQuery,
  useGetAuditLogFilterOptionsQuery,
} = auditLogsApi
