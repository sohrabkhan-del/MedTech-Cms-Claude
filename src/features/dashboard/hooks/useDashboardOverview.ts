import { useGetDashboardOverviewQuery } from '@/features/dashboard/services/dashboardApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDashboardOverview() {
  const { data: overview, isLoading, error: queryError } = useGetDashboardOverviewQuery()
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load dashboard overview.') : null

  return { overview: overview ?? null, isLoading, error }
}
