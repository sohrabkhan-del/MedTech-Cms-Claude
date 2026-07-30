import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetProductReportDetailQuery } from '@/features/reportsAnalytics/services/productReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductReportDetail(productReportId: string | undefined) {
  const { data: report, isLoading, error: queryError } = useGetProductReportDetailQuery(productReportId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load product report.') : null

  return { report, isLoading, error }
}
