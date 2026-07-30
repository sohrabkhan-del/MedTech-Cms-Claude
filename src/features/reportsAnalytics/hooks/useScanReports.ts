import {
  useGetScanReportsQuery,
  useGetScanReportKpisQuery,
  useGetScanReportFilterOptionsQuery,
} from '@/features/reportsAnalytics/services/scanReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useScanReports() {
  const reportsResult = useGetScanReportsQuery()
  const kpisResult = useGetScanReportKpisQuery()
  const filterOptionsResult = useGetScanReportFilterOptionsQuery()

  const isLoading = reportsResult.isLoading || kpisResult.isLoading || filterOptionsResult.isLoading
  const error = reportsResult.error
    ? getApiErrorMessage(reportsResult.error, 'Failed to load scan reports.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load scan reports.')
      : filterOptionsResult.error
        ? getApiErrorMessage(filterOptionsResult.error, 'Failed to load scan reports.')
        : null

  return {
    reports: reportsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    filterOptions: filterOptionsResult.data ?? null,
    isLoading,
    error,
  }
}
