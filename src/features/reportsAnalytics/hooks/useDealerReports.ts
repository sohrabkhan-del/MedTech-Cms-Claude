import {
  useGetDealerReportsQuery,
  useGetDealerReportKpisQuery,
} from '@/features/reportsAnalytics/services/dealerReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDealerReports() {
  const reportsResult = useGetDealerReportsQuery()
  const kpisResult = useGetDealerReportKpisQuery()

  const isLoading = reportsResult.isLoading || kpisResult.isLoading
  const error = reportsResult.error
    ? getApiErrorMessage(reportsResult.error, 'Failed to load dealer reports.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load dealer reports.')
      : null

  return {
    reports: reportsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
