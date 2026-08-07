import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetChemistDetailQuery,
  useActivateChemistMutation,
  useDeactivateChemistMutation,
  useDeleteChemistMutation,
} from '@/features/userManagement/services/chemistApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemistDetail(chemistId: string | undefined) {
  const toast = useToast()
  const { data: chemist, isLoading, error: queryError } = useGetChemistDetailQuery(chemistId ?? skipToken)
  const [activateMutation, { isLoading: isActivating }] = useActivateChemistMutation()
  const [deactivateMutation, { isLoading: isDeactivating }] = useDeactivateChemistMutation()
  const [deleteMutation, { isLoading: isDeleting }] = useDeleteChemistMutation()
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load chemist.') : null

  async function activate() {
    if (!chemistId) return
    try {
      await activateMutation(chemistId).unwrap()
      toast.success('Chemist activated successfully.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to activate chemist.'))
    }
  }

  async function deactivate() {
    if (!chemistId) return
    try {
      await deactivateMutation(chemistId).unwrap()
      toast.success('Chemist deactivated successfully.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to deactivate chemist.'))
    }
  }

  async function remove() {
    if (!chemistId) return
    try {
      await deleteMutation(chemistId).unwrap()
      toast.success('Chemist deleted successfully.')
      return true
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete chemist.'))
      return false
    }
  }

  return {
    chemist,
    isLoading,
    error,
    activate,
    deactivate,
    remove,
    isUpdatingStatus: isActivating || isDeactivating,
    isDeleting,
  }
}
