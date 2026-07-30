import {
  useGetAuditLogsQuery,
  useGetAuditLogKpisQuery,
  useGetAuditLogFilterOptionsQuery,
} from '@/features/audit/services/auditLogsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useAuditLogs() {
  const logsResult = useGetAuditLogsQuery()
  const kpisResult = useGetAuditLogKpisQuery()
  const filterOptionsResult = useGetAuditLogFilterOptionsQuery()

  const isLoading = logsResult.isLoading || kpisResult.isLoading || filterOptionsResult.isLoading

  const error = logsResult.error
    ? getApiErrorMessage(logsResult.error, 'Failed to load audit logs.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load audit logs.')
      : filterOptionsResult.error
        ? getApiErrorMessage(filterOptionsResult.error, 'Failed to load audit logs.')
        : null

  return {
    logs: logsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    filterOptions: filterOptionsResult.data ?? null,
    isLoading,
    error,
  }
}
