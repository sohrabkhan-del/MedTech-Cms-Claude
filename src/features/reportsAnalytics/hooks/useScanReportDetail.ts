import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetScanReportDetailQuery } from '@/features/reportsAnalytics/services/scanReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useScanReportDetail(scanId: string | undefined) {
  const { data: report, isLoading, error: queryError } = useGetScanReportDetailQuery(scanId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load scan report.') : null

  return { report, isLoading, error }
}
