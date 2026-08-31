import {
  useGetSecurityAlertsQuery,
  useGetSecurityAlertKpisQuery,
  type SecurityAlertQueryParams,
} from '@/features/fieldOperations/services/securityAlertsApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const ALL_INDIA_REGION = 'All India'

export function useSecurityAlerts(params?: SecurityAlertQueryParams) {
  const { region, regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const topbarEffectiveRegionId =
    region === ALL_INDIA_REGION ? undefined : (topbarRegionId ?? undefined)
  const effectiveRegionId = params?.regionId || topbarEffectiveRegionId
  const queryParams = {
    ...params,
    ...analyticsParams,
    regionId: effectiveRegionId,
  }

  const alertsResult = useGetSecurityAlertsQuery(queryParams)
  const kpisResult = useGetSecurityAlertKpisQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
  })

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
