import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetInterestedUserDetailQuery,
  useFollowUpLeadMutation,
  useCloseLeadMutation,
  useDeleteLeadMutation,
} from '@/features/marketingProducts/services/interestedUsersApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useInterestedUserDetail(leadId: string | undefined) {
  const { data: lead, isFetching: isLoading, error: queryError } = useGetInterestedUserDetailQuery(leadId ?? skipToken)
  const [followUpLeadMutation, followUpState] = useFollowUpLeadMutation()
  const [closeLeadMutation, closeState] = useCloseLeadMutation()
  const [deleteLeadMutation] = useDeleteLeadMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load lead.') : null

  async function followUp(followUpNote: string, closeReason?: string) {
    if (!leadId) return
    await followUpLeadMutation({ id: leadId, followUpNote, closeReason }).unwrap()
  }

  async function close(closeReason: string) {
    if (!leadId) return
    await closeLeadMutation({ id: leadId, closeReason }).unwrap()
  }

  async function remove() {
    if (!leadId) return
    await deleteLeadMutation(leadId).unwrap()
  }

  return {
    lead,
    isLoading,
    error,
    followUp,
    isFollowingUp: followUpState.isLoading,
    close,
    isClosing: closeState.isLoading,
    remove,
  }
}
