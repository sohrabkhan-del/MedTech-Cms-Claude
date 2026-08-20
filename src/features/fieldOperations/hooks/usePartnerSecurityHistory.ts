import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetPartnerSecurityHistoryQuery } from '@/features/fieldOperations/services/securityAlertsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function usePartnerSecurityHistory(
  partnerId: string | undefined,
  params?: { page?: number; limit?: number; search?: string },
) {
  const {
    data,
    isFetching,
    error: queryError,
  } = useGetPartnerSecurityHistoryQuery(
    partnerId ? { partnerId, ...params } : skipToken,
  )

  const error = queryError
    ? getApiErrorMessage(queryError, 'Failed to load partner security history.')
    : null

  return {
    alerts: data?.items ?? [],
    totalItems: data?.totalItems ?? 0,
    isLoading: isFetching,
    error,
  }
}
