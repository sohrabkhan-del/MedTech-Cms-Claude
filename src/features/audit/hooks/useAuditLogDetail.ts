import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetAuditLogDetailQuery } from '@/features/audit/services/auditLogsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useAuditLogDetail(entityId: string | undefined) {
  const {
    data: log,
    isLoading,
    error: queryError,
  } = useGetAuditLogDetailQuery(entityId ?? skipToken)

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load audit log.') : null

  return { log, isLoading, error }
}
