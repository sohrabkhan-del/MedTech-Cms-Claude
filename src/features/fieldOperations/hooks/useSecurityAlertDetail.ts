import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetSecurityAlertDetailQuery } from '@/features/fieldOperations/services/securityAlertsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSecurityAlertDetail(alertId: string | undefined) {
  const { data, isLoading, error: queryError } = useGetSecurityAlertDetailQuery(
    alertId ?? skipToken,
  )

  const error = queryError
    ? getApiErrorMessage(queryError, 'Failed to load security alert.')
    : null

  return {
    alert: data,
    isLoading,
    error,
  }
}
