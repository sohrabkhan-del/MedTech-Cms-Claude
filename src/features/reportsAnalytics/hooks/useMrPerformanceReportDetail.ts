import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetMrPerformanceDetailsQuery } from '@/features/reportsAnalytics/services/mrPerformanceReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMrPerformanceReportDetail(mrReportId: string | undefined) {
  const { data: details, isLoading, error: queryError } = useGetMrPerformanceDetailsQuery(mrReportId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load MR performance details.') : null

  return { details, isLoading, error }
}
