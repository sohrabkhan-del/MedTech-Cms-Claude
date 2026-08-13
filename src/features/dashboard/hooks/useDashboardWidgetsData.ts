import { useGetDashboardWidgetsDataQuery } from '@/features/dashboard/services/dashboardApi'
import { useAnalyticsCardsParams } from '@/features/dashboard/hooks/useAnalyticsCardsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Backs all dashboard widgets (activity timeline, recent scans, leaderboard, etc). */
export function useDashboardWidgetsData() {
  const params = useAnalyticsCardsParams()
  const { data, isLoading, error: queryError } = useGetDashboardWidgetsDataQuery(params)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load dashboard widgets.') : null

  return { data: data ?? null, isLoading, error }
}
