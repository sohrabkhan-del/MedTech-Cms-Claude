import {
  useGetSecurityAlertsQuery,
  useGetSecurityAlertKpisQuery,
} from '@/features/fieldOperations/services/securityAlertsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSecurityAlerts() {
  const alertsResult = useGetSecurityAlertsQuery()
  const kpisResult = useGetSecurityAlertKpisQuery()

  const isLoading = alertsResult.isLoading || kpisResult.isLoading
  const error = alertsResult.error
    ? getApiErrorMessage(alertsResult.error, 'Failed to load security alerts.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load security alerts.')
      : null

  return {
    alerts: alertsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
