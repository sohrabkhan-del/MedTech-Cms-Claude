import {
  useGetSchemeReportsQuery,
  useGetSchemeReportKpisQuery,
  useGetSchemeReportFilterOptionsQuery,
} from '@/features/reportsAnalytics/services/schemeReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSchemeReports() {
  const reportsResult = useGetSchemeReportsQuery()
  const kpisResult = useGetSchemeReportKpisQuery()
  const filterOptionsResult = useGetSchemeReportFilterOptionsQuery()

  const isLoading = reportsResult.isLoading || kpisResult.isLoading || filterOptionsResult.isLoading
  const error = reportsResult.error
    ? getApiErrorMessage(reportsResult.error, 'Failed to load scheme reports.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load scheme reports.')
      : filterOptionsResult.error
        ? getApiErrorMessage(filterOptionsResult.error, 'Failed to load scheme reports.')
        : null

  return {
    reports: reportsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    filterOptions: filterOptionsResult.data ?? null,
    isLoading,
    error,
  }
}
