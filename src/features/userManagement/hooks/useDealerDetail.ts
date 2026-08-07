import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetDealerDetailQuery,
  useActivateDealerMutation,
  useDeactivateDealerMutation,
  useDeleteDealerMutation,
} from '@/features/userManagement/services/dealerApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDealerDetail(dealerId: string | undefined) {
  const toast = useToast()
  const { data: dealer, isLoading, error: queryError } = useGetDealerDetailQuery(dealerId ?? skipToken)
  const [activateMutation, { isLoading: isActivating }] = useActivateDealerMutation()
  const [deactivateMutation, { isLoading: isDeactivating }] = useDeactivateDealerMutation()
  const [deleteMutation, { isLoading: isDeleting }] = useDeleteDealerMutation()
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load dealer.') : null

  async function activate() {
    if (!dealerId) return
    try {
      await activateMutation(dealerId).unwrap()
      toast.success('Dealer activated successfully.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to activate dealer.'))
    }
  }

  async function deactivate() {
    if (!dealerId) return
    try {
      await deactivateMutation(dealerId).unwrap()
      toast.success('Dealer deactivated successfully.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to deactivate dealer.'))
    }
  }

  async function remove() {
    if (!dealerId) return
    try {
      await deleteMutation(dealerId).unwrap()
      toast.success('Dealer deleted successfully.')
      return true
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete dealer.'))
      return false
    }
  }

  return {
    dealer,
    isLoading,
    error,
    activate,
    deactivate,
    remove,
    isUpdatingStatus: isActivating || isDeactivating,
    isDeleting,
  }
}
