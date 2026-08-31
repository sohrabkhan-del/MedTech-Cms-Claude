import {
  useGetApprovalRequestsQuery,
  useGetApprovalRequestAnalyticsQuery,
  useDecideApprovalRequestMutation,
  type VerificationQueryParams,
} from '@/features/userManagement/services/verificationApi'
import type { ApprovalStatus } from '@/types/approvalRequest'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useApprovalRequests(
  params?: VerificationQueryParams & { status?: ApprovalStatus },
) {
  const { regionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const effectiveRegionId = params?.regionId || regionId || undefined

  const requestsResult = useGetApprovalRequestsQuery({
    ...params,
    ...analyticsParams,
    regionId: effectiveRegionId,
    status: params?.status,
  })
  const analyticsResult = useGetApprovalRequestAnalyticsQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
    // forward partner type (Dealer/Chemist) so analytics cards are scoped
    type: params?.type,
  })
  const [decideMutation] = useDecideApprovalRequestMutation()

  const isLoading = requestsResult.isFetching || analyticsResult.isFetching
  const error = requestsResult.error
    ? getApiErrorMessage(
        requestsResult.error,
        'Failed to load approval requests.',
      )
    : analyticsResult.error
      ? getApiErrorMessage(
          analyticsResult.error,
          'Failed to load approval requests.',
        )
      : null

  async function decide(
    id: string,
    decision: 'approve' | 'reject',
    remarks?: string,
  ) {
    await decideMutation({ id, decision, remarks }).unwrap()
  }

  return {
    requests: requestsResult.data?.items ?? [],
    totalItems: requestsResult.data?.totalItems ?? 0,
    kpis: analyticsResult.data ?? null,
    isLoading,
    error,
    decide,
  }
}
