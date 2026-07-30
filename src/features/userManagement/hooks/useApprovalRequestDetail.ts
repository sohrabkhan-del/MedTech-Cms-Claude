import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetApprovalRequestDetailQuery,
  useDecideApprovalRequestMutation,
} from '@/features/userManagement/services/verificationApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useApprovalRequestDetail(requestId: string | undefined) {
  const { data: request, isLoading, error: queryError } = useGetApprovalRequestDetailQuery(requestId ?? skipToken)
  const [decideMutation] = useDecideApprovalRequestMutation()
  const [isDeciding, setIsDeciding] = useState(false)

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load approval request.') : null

  async function decide(decision: 'approve' | 'reject', remarks?: string) {
    if (!requestId) return
    setIsDeciding(true)
    try {
      await decideMutation({ id: requestId, decision, remarks }).unwrap()
    } finally {
      setIsDeciding(false)
    }
  }

  return { request, isLoading, error, decide, isDeciding }
}
