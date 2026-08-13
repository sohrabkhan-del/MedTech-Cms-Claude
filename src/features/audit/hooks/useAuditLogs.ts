import {
  useGetAuditLogsQuery,
  type AuditLogsQueryParams,
} from '@/features/audit/services/auditLogsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Backs the Audit Logs listing page — GET /audit/timeline with server-side
 *  pagination, search, entity/action filter, and date-range filtering. */
export function useAuditLogs(params: AuditLogsQueryParams) {
  const { data, isFetching, error: queryError } = useGetAuditLogsQuery(params)

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load audit logs.') : null

  return {
    logs: data?.items ?? [],
    totalItems: data?.totalItems ?? 0,
    isLoading: isFetching,
    error,
  }
}
