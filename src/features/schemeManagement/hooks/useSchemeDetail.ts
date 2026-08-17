import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetSchemeDetailQuery,
  useGetSchemePartnersQuery,
  useUpdateSchemeStatusMutation,
  useDeleteSchemeMutation,
} from '@/features/schemeManagement/services/schemesApi'
import type { SchemeStatus } from '@/features/schemeManagement/types/schemeManagement.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSchemeDetail(schemeId: string | undefined) {
  const { data: scheme, isLoading, error: queryError } = useGetSchemeDetailQuery(schemeId ?? skipToken)
  const {
    data: partners,
    isLoading: isPartnersLoading,
    error: partnersError,
  } = useGetSchemePartnersQuery(schemeId ?? skipToken)
  const [updateStatusMutation] = useUpdateSchemeStatusMutation()
  const [deleteSchemeMutation] = useDeleteSchemeMutation()

  const error = queryError
    ? getApiErrorMessage(queryError, 'Failed to load scheme.')
    : partnersError
      ? getApiErrorMessage(partnersError, 'Failed to load scheme partners.')
      : null
  const schemeWithPartners =
    scheme && partners ? { ...scheme, partners } : scheme

  async function remove() {
    if (!schemeId) return
    await deleteSchemeMutation(schemeId).unwrap()
  }

  async function setStatus(status: SchemeStatus) {
    if (!schemeId) return
    await updateStatusMutation({ id: schemeId, status }).unwrap()
  }

  return {
    scheme: schemeWithPartners,
    isLoading: isLoading || isPartnersLoading,
    error,
    remove,
    setStatus,
  }
}
