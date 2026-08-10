import {
  useGetSecurityAlertsQuery,
  useGetSecurityAlertKpisQuery,
  type SecurityAlertQueryParams,
} from '@/features/fieldOperations/services/securityAlertsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSecurityAlerts(params?: SecurityAlertQueryParams) {
  const alertsResult = useGetSecurityAlertsQuery(params)
  const kpisResult = useGetSecurityAlertKpisQuery()

  const isLoading = alertsResult.isFetching || kpisResult.isFetching
  const error = alertsResult.error
    ? getApiErrorMessage(alertsResult.error, 'Failed to load security alerts.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load security alerts.')
      : null

  return {
    alerts: alertsResult.data?.items ?? [],
    totalItems: alertsResult.data?.totalItems ?? 0,
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
