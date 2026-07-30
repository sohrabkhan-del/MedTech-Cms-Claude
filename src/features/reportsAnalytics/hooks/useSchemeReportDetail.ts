import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetSchemeReportDetailQuery } from '@/features/reportsAnalytics/services/schemeReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSchemeReportDetail(schemeReportId: string | undefined) {
  const { data: report, isLoading, error: queryError } = useGetSchemeReportDetailQuery(schemeReportId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load scheme report.') : null

  return { report, isLoading, error }
}
