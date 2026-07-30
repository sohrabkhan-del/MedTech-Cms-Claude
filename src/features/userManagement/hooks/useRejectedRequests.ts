import {
  useGetApprovalRequestsQuery,
  useGetRejectedRequestKpisQuery,
  useGetRejectedReviewersQuery,
  useReopenRequestMutation,
  useDeleteRequestMutation,
} from '@/features/userManagement/services/verificationApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useRejectedRequests() {
  const requestsResult = useGetApprovalRequestsQuery('rejected')
  const kpisResult = useGetRejectedRequestKpisQuery()
  const reviewersResult = useGetRejectedReviewersQuery()
  const [reopenMutation] = useReopenRequestMutation()
  const [deleteMutation] = useDeleteRequestMutation()

  const isLoading = requestsResult.isLoading || kpisResult.isLoading || reviewersResult.isLoading
  const error = requestsResult.error
    ? getApiErrorMessage(requestsResult.error, 'Failed to load rejected requests.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load rejected requests.')
      : reviewersResult.error
        ? getApiErrorMessage(reviewersResult.error, 'Failed to load rejected requests.')
        : null

  async function reopen(id: string) {
    await reopenMutation(id).unwrap()
  }

  async function remove(id: string) {
    await deleteMutation(id).unwrap()
  }

  return {
    requests: requestsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    reviewers: reviewersResult.data ?? [],
    isLoading,
    error,
    reopen,
    remove,
  }
}
