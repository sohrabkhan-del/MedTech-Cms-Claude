import {
  useGetMrPerformanceReportsQuery,
  useGetMrPerformanceKpisQuery,
} from '@/features/reportsAnalytics/services/mrPerformanceReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMrPerformanceReports() {
  const reportsResult = useGetMrPerformanceReportsQuery()
  const kpisResult = useGetMrPerformanceKpisQuery()

  const isLoading = reportsResult.isLoading || kpisResult.isLoading
  const error = reportsResult.error
    ? getApiErrorMessage(reportsResult.error, 'Failed to load MR performance reports.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load MR performance reports.')
      : null

  return {
    reports: reportsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
