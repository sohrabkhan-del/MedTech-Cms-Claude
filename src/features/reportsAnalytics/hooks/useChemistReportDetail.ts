import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetChemistReportDetailQuery,
  useGetChemistPerformanceSummaryQuery,
} from '@/features/reportsAnalytics/services/chemistReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemistReportDetail(chemistReportId: string | undefined) {
  const {
    data: report,
    isLoading: isReportLoading,
    error: reportError,
  } = useGetChemistReportDetailQuery(chemistReportId ?? skipToken)
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useGetChemistPerformanceSummaryQuery(chemistReportId ?? skipToken)

  const isLoading = isReportLoading || isSummaryLoading
  const error = reportError
    ? getApiErrorMessage(reportError, 'Failed to load chemist report.')
    : summaryError
      ? getApiErrorMessage(summaryError, 'Failed to load chemist report.')
      : null

  return { report, summary, isLoading, error }
}
