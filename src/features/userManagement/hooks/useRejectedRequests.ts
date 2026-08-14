import {
  useGetApprovalRequestsQuery,
  useGetRejectedRequestKpisQuery,
  useReopenRequestMutation,
  useDeleteRequestMutation,
  type VerificationQueryParams,
} from '@/features/userManagement/services/verificationApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useRejectedRequests(params?: VerificationQueryParams) {
  const { regionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const effectiveRegionId = params?.regionId || regionId || undefined

  const requestsResult = useGetApprovalRequestsQuery({
    ...params,
    ...analyticsParams,
    regionId: effectiveRegionId,
    status: 'rejected',
  })
  const kpisResult = useGetRejectedRequestKpisQuery()
  const [reopenMutation] = useReopenRequestMutation()
  const [deleteMutation] = useDeleteRequestMutation()

  const isLoading = requestsResult.isFetching || kpisResult.isFetching
  const error = requestsResult.error
    ? getApiErrorMessage(requestsResult.error, 'Failed to load rejected requests.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load rejected requests.')
      : null

  async function reopen(id: string, reason = 'Reopened for review') {
    await reopenMutation({ id, reason }).unwrap()
  }

  async function remove(id: string) {
    await deleteMutation(id).unwrap()
  }

  const requests = requestsResult.data?.items ?? []
  const reviewers = Array.from(
    new Set(requests.map((r) => r.reviewedBy).filter((name): name is string => !!name)),
  )

  return {
    requests,
    totalItems: requestsResult.data?.totalItems ?? 0,
    kpis: kpisResult.data ?? null,
    reviewers,
    isLoading,
    error,
    reopen,
    remove,
  }
}
