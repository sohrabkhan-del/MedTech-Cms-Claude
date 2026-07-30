import {
  useGetProductReportsQuery,
  useGetProductReportKpisQuery,
  useGetProductReportFilterOptionsQuery,
} from '@/features/reportsAnalytics/services/productReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductReports() {
  const reportsResult = useGetProductReportsQuery()
  const kpisResult = useGetProductReportKpisQuery()
  const filterOptionsResult = useGetProductReportFilterOptionsQuery()

  const isLoading = reportsResult.isLoading || kpisResult.isLoading || filterOptionsResult.isLoading
  const error = reportsResult.error
    ? getApiErrorMessage(reportsResult.error, 'Failed to load product reports.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load product reports.')
      : filterOptionsResult.error
        ? getApiErrorMessage(filterOptionsResult.error, 'Failed to load product reports.')
        : null

  return {
    reports: reportsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    filterOptions: filterOptionsResult.data ?? null,
    isLoading,
    error,
  }
}
