import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetSchemeDetailQuery,
  useUpdateSchemeStatusMutation,
  useDeleteSchemeMutation,
} from '@/features/schemeManagement/services/schemesApi'
import type { SchemeStatus } from '@/features/schemeManagement/types/schemeManagement.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSchemeDetail(schemeId: string | undefined) {
  const { data: scheme, isLoading, error: queryError } = useGetSchemeDetailQuery(schemeId ?? skipToken)
  const [updateStatusMutation] = useUpdateSchemeStatusMutation()
  const [deleteSchemeMutation] = useDeleteSchemeMutation()

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load scheme.') : null

  async function remove() {
    if (!schemeId) return
    await deleteSchemeMutation(schemeId).unwrap()
  }

  async function setStatus(status: SchemeStatus) {
    if (!schemeId) return
    await updateStatusMutation({ id: schemeId, status }).unwrap()
  }

  return { scheme, isLoading, error, remove, setStatus }
}
