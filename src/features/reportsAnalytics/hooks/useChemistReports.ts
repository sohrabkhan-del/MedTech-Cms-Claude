import {
  useGetChemistReportsQuery,
  useGetChemistReportKpisQuery,
} from '@/features/reportsAnalytics/services/chemistReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemistReports() {
  const reportsResult = useGetChemistReportsQuery()
  const kpisResult = useGetChemistReportKpisQuery()

  const isLoading = reportsResult.isLoading || kpisResult.isLoading
  const error = reportsResult.error
    ? getApiErrorMessage(reportsResult.error, 'Failed to load chemist reports.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load chemist reports.')
      : null

  return {
    reports: reportsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
