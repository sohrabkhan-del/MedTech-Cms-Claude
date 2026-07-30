import {
  useGetRewardReportsQuery,
  useGetRewardReportKpisQuery,
  useGetRewardReportFilterOptionsQuery,
} from '@/features/reportsAnalytics/services/rewardReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useRewardReports() {
  const reportsResult = useGetRewardReportsQuery()
  const kpisResult = useGetRewardReportKpisQuery()
  const filterOptionsResult = useGetRewardReportFilterOptionsQuery()

  const isLoading = reportsResult.isLoading || kpisResult.isLoading || filterOptionsResult.isLoading
  const error = reportsResult.error
    ? getApiErrorMessage(reportsResult.error, 'Failed to load reward reports.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load reward reports.')
      : filterOptionsResult.error
        ? getApiErrorMessage(filterOptionsResult.error, 'Failed to load reward reports.')
        : null

  return {
    reports: reportsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    filterOptions: filterOptionsResult.data ?? null,
    isLoading,
    error,
  }
}
