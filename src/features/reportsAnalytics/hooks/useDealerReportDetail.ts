import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetDealerReportDetailQuery } from '@/features/reportsAnalytics/services/dealerReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDealerReportDetail(dealerReportId: string | undefined) {
  const { data: report, isLoading, error: queryError } = useGetDealerReportDetailQuery(dealerReportId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load dealer report.') : null

  return { report, isLoading, error }
}
