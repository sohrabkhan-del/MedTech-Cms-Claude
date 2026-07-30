import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetChemistDetailQuery,
  useActivateChemistMutation,
  useDeactivateChemistMutation,
} from '@/features/userManagement/services/chemistApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemistDetail(chemistId: string | undefined) {
  const toast = useToast()
  const { data: chemist, isLoading, error: queryError } = useGetChemistDetailQuery(chemistId ?? skipToken)
  const [activateMutation] = useActivateChemistMutation()
  const [deactivateMutation] = useDeactivateChemistMutation()
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

  return { chemist, isLoading, error, activate, deactivate }
}
