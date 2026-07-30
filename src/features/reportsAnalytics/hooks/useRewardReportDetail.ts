import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetRewardReportDetailQuery } from '@/features/reportsAnalytics/services/rewardReportsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useRewardReportDetail(rewardId: string | undefined) {
  const { data: report, isLoading, error: queryError } = useGetRewardReportDetailQuery(rewardId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load reward report.') : null

  return { report, isLoading, error }
}
