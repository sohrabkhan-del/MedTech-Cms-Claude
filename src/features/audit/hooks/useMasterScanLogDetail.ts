import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetMasterScanLogDetailQuery } from '@/features/audit/services/masterScanLogsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMasterScanLogDetail(logId: string | undefined) {
  const {
    data: log,
    isLoading,
    error: queryError,
  } = useGetMasterScanLogDetailQuery(logId ?? skipToken)

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load master scan log.') : null

  return { log, isLoading, error }
}
