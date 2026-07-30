import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetInterestedUserDetailQuery,
  useSetLeadStatusMutation,
  useDeleteLeadMutation,
} from '@/features/marketingProducts/services/interestedUsersApi'
import type { LeadStatus } from '@/features/marketingProducts/types/marketingProducts.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useInterestedUserDetail(leadId: string | undefined) {
  const [statusOverride, setStatusOverride] = useState<LeadStatus | null>(null)

  const { data: fetchedLead, isLoading, error: queryError } = useGetInterestedUserDetailQuery(leadId ?? skipToken)
  const [setLeadStatusMutation] = useSetLeadStatusMutation()
  const [deleteLeadMutation] = useDeleteLeadMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load lead.') : null

  async function setStatus(status: LeadStatus) {
    if (!leadId) return
    await setLeadStatusMutation({ id: leadId, status }).unwrap()
    setStatusOverride(status)
  }

  async function remove() {
    if (!leadId) return
    await deleteLeadMutation(leadId).unwrap()
  }

  const lead = fetchedLead && statusOverride ? { ...fetchedLead, leadStatus: statusOverride } : fetchedLead

  return { lead, isLoading, error, setStatus, remove }
}
