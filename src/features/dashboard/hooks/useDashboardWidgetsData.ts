import { useGetDashboardWidgetsDataQuery } from '@/features/dashboard/services/dashboardApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Backs all dashboard widgets (activity timeline, recent scans, leaderboard, etc). */
export function useDashboardWidgetsData() {
  const { data, isLoading, error: queryError } = useGetDashboardWidgetsDataQuery()
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load dashboard widgets.') : null

  return { data: data ?? null, isLoading, error }
}
