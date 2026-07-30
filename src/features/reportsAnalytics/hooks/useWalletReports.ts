import {
  useGetWalletReportsQuery,
  useGetWalletReportKpisQuery,
} from '@/features/reportsAnalytics/services/walletReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useWalletReports() {
  const reportsResult = useGetWalletReportsQuery()
  const kpisResult = useGetWalletReportKpisQuery()

  const isLoading = reportsResult.isLoading || kpisResult.isLoading
  const error = reportsResult.error
    ? getApiErrorMessage(reportsResult.error, 'Failed to load wallet reports.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load wallet reports.')
      : null

  return {
    reports: reportsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
