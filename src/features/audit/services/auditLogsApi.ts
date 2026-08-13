import { baseApi } from '@/store/api/baseApi'
import type {
  AuditChangedField,
  AuditLogEntry,
  AuditLogListResponse,
  AuditTimelineApiEntry,
  AuditTimelineApiListResponse,
} from '@/types/auditLog'

// Audit Logs are read-only per product spec — this endpoint file only exposes
// list/detail queries, no create/update/delete mutations.

export interface AuditLogsQueryParams {
  page?: number
  limit?: number
  search?: string
  entity?: string
  entityId?: string
  action?: string
  startDate?: string
  endDate?: string
}

// Fields that must never be surfaced in the audit UI, even though the API
// includes them in raw before/after snapshots.
const SENSITIVE_FIELDS = new Set([
  '_id',
  '__v',
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'otp',
])

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function diffChangedFields(entry: AuditTimelineApiEntry): AuditChangedField[] {
  const before = entry.before ?? {}
  const after = entry.after ?? {}
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  const changed: AuditChangedField[] = []
  let i = 0
  for (const key of keys) {
    if (SENSITIVE_FIELDS.has(key)) continue
    const oldRaw = (before as Record<string, unknown>)[key]
    const newRaw = (after as Record<string, unknown>)[key]
    if (JSON.stringify(oldRaw) === JSON.stringify(newRaw)) continue
    changed.push({
      id: `${entry.id}-change-${i++}`,
      fieldName: key,
      oldValue: formatFieldValue(oldRaw),
      newValue: formatFieldValue(newRaw),
    })
  }
  return changed
}

function mapEntry(entry: AuditTimelineApiEntry): AuditLogEntry {
  const actorLabel = entry.actor?.name || entry.actor?.email || entry.actorId
  const after = entry.after as
    | { name?: string; productName?: string; outletName?: string }
    | null
  const entityLabel =
    after?.outletName || after?.name || after?.productName || entry.entityId

  return {
    id: entry.id,
    module: entry.entity,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    entityName: entityLabel,
    reason: entry.reason,
    performedBy: actorLabel,
    userRole: entry.actor?.type || entry.actorType,
    dateTime: entry.createdAt,
    ipAddress: entry.ip,
    changedData: diffChangedFields(entry),
  }
}

const auditLogsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /audit/timeline — paginated feed of before/after change events,
     *  mapped onto the Audit Logs table (search, entity/action filter, date range). */
    getAuditLogs: builder.query<AuditLogListResponse, AuditLogsQueryParams | void>({
      query: (params) => ({
        tag: 'AuditLogs',
        url: '/audit/timeline',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          search: params?.search || undefined,
          entity: params?.entity || undefined,
          entityId: params?.entityId || undefined,
          action: params?.action || undefined,
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
        mockResolver: () => {
          throw new Error('Audit logs has no mock mode — real API only.')
        },
      }),
      transformResponse: (
        response:
          | { success: boolean; data: AuditTimelineApiListResponse }
          | AuditTimelineApiListResponse,
      ): AuditLogListResponse => {
        const data = 'data' in response ? response.data : response
        return {
          items: data.items.map(mapEntry),
          totalItems: data.totalItems,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          pageSize: data.pageSize,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'AuditLogs' as const, id })),
              { type: 'AuditLogs' as const, id: 'LIST' },
            ]
          : [{ type: 'AuditLogs' as const, id: 'LIST' }],
    }),

    /** GET /audit/timeline?entityId={entityId} — most recent change event for an
     *  entity, mapped onto the Audit Log details page. */
    getAuditLogDetail: builder.query<AuditLogEntry | undefined, string>({
      query: (entityId) => ({
        tag: 'AuditLogs',
        url: '/audit/timeline',
        params: { entityId, page: 1, limit: 1 },
        mockResolver: () => {
          throw new Error('Audit logs has no mock mode — real API only.')
        },
      }),
      transformResponse: (
        response:
          | { success: boolean; data: AuditTimelineApiListResponse }
          | AuditTimelineApiListResponse,
      ): AuditLogEntry | undefined => {
        const data = 'data' in response ? response.data : response
        const entry = data.items[0]
        return entry ? mapEntry(entry) : undefined
      },
      providesTags: (_result, _error, entityId) => [{ type: 'AuditLogs', id: entityId }],
    }),
  }),
})

export const { useGetAuditLogsQuery, useGetAuditLogDetailQuery } = auditLogsApi
