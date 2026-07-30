import {
  useGetApprovalRequestsQuery,
  useGetApprovalRequestKpisQuery,
  useDecideApprovalRequestMutation,
} from '@/features/userManagement/services/verificationApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useApprovalRequests() {
  const requestsResult = useGetApprovalRequestsQuery()
  const kpisResult = useGetApprovalRequestKpisQuery()
  const [decideMutation] = useDecideApprovalRequestMutation()

  const isLoading = requestsResult.isLoading || kpisResult.isLoading
  const error = requestsResult.error
    ? getApiErrorMessage(requestsResult.error, 'Failed to load approval requests.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load approval requests.')
      : null

  async function decide(id: string, decision: 'approve' | 'reject', remarks?: string) {
    await decideMutation({ id, decision, remarks }).unwrap()
  }

  return {
    requests: requestsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
    decide,
  }
}
