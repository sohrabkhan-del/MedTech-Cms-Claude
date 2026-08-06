import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetMedicalRepDetailQuery,
  useSetMedicalRepStatusMutation,
  useDeleteMedicalRepMutation,
} from '@/features/systemUsers/services/medicalRepsApi'
import type { PartnerStatus } from '@/features/systemUsers/types/systemUsers.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMedicalRepDetail(mrId: string | undefined) {
  const toast = useToast()

  const { data: mr, isLoading: isMrLoading, error: mrQueryError } = useGetMedicalRepDetailQuery(mrId ?? skipToken)
  const [setStatusMutation, { isLoading: isStatusUpdating }] = useSetMedicalRepStatusMutation()
  const [deleteMrMutation, { isLoading: isDeleting }] = useDeleteMedicalRepMutation()

  const isLoading = isMrLoading
  const error = mrQueryError ? getApiErrorMessage(mrQueryError, 'Failed to load medical representative.') : null

  async function setStatus(status: PartnerStatus) {
    if (!mrId) return
    await setStatusMutation({ id: mrId, status }).unwrap()
  }

  async function remove(replacementMrId: string): Promise<boolean> {
    if (!mrId) return false
    try {
      await deleteMrMutation({ id: mrId, replacementMrId }).unwrap()
      toast.success('Medical rep deleted successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to delete medical representative.')
      toast.error(message)
      return false
    }
  }

  return {
    mr,
    isLoading,
    isStatusUpdating,
    isDeleting,
    error,
    setStatus,
    remove,
  }
}
