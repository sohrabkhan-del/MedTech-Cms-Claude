import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetWalletReportDetailQuery } from '@/features/reportsAnalytics/services/walletReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useWalletReportDetail(walletReportId: string | undefined) {
  const { data: report, isLoading, error: queryError } = useGetWalletReportDetailQuery(walletReportId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load wallet report.') : null

  return { report, isLoading, error }
}
