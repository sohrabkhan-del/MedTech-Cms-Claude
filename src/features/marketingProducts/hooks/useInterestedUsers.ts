import { useState } from 'react'
import {
  useGetInterestedUsersQuery,
  useGetInterestedUserKpisQuery,
  useGetHandlerOptionsQuery,
  useSetLeadStatusMutation,
  useDeleteLeadMutation,
} from '@/features/marketingProducts/services/interestedUsersApi'
import type { LeadStatus } from '@/features/marketingProducts/types/marketingProducts.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useInterestedUsers() {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LeadStatus>>({})
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const leadsResult = useGetInterestedUsersQuery()
  const kpisResult = useGetInterestedUserKpisQuery()
  const handlerOptionsResult = useGetHandlerOptionsQuery()
  const [setLeadStatusMutation] = useSetLeadStatusMutation()
  const [deleteLeadMutation] = useDeleteLeadMutation()

  const isLoading = leadsResult.isLoading || kpisResult.isLoading || handlerOptionsResult.isLoading
  const error = leadsResult.error
    ? getApiErrorMessage(leadsResult.error, 'Failed to load interested users.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load interested users.')
      : handlerOptionsResult.error
        ? getApiErrorMessage(handlerOptionsResult.error, 'Failed to load interested users.')
        : null

  async function setStatus(id: string, status: LeadStatus) {
    await setLeadStatusMutation({ id, status }).unwrap()
    setStatusOverrides((prev) => ({ ...prev, [id]: status }))
  }

  async function remove(id: string) {
    await deleteLeadMutation(id).unwrap()
    setDeletedIds((prev) => new Set(prev).add(id))
  }

  const leads = (leadsResult.data ?? [])
    .filter((lead) => !deletedIds.has(lead.id))
    .map((lead) => ({ ...lead, leadStatus: statusOverrides[lead.id] ?? lead.leadStatus }))

  return {
    leads,
    kpis: kpisResult.data ?? null,
    handlerOptions: handlerOptionsResult.data ?? [],
    isLoading,
    error,
    setStatus,
    remove,
  }
}
