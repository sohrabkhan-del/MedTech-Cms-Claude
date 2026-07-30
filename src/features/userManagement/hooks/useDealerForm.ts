import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetDealerDetailQuery,
  useGetMrOptionsQuery,
  useCreateDealerMutation,
  useUpdateDealerMutation,
} from '@/features/userManagement/services/partnersApi'
import type { DealerFormValues } from '@/features/userManagement/types/userManagement.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDealerForm(dealerId: string | undefined) {
  const isEdit = !!dealerId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const dealerResult = useGetDealerDetailQuery(dealerId ?? skipToken)
  const mrOptionsResult = useGetMrOptionsQuery()
  const [createDealer] = useCreateDealerMutation()
  const [updateDealer] = useUpdateDealerMutation()

  const isLoading = (isEdit && dealerResult.isLoading) || mrOptionsResult.isLoading
  const loadError = dealerResult.error
    ? getApiErrorMessage(dealerResult.error, 'Failed to load dealer form data.')
    : mrOptionsResult.error
      ? getApiErrorMessage(mrOptionsResult.error, 'Failed to load dealer form data.')
      : null

  async function submit(values: DealerFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && dealerId) {
        await updateDealer({ id: dealerId, values }).unwrap()
      } else {
        await createDealer(values).unwrap()
      }
      toast.success(isEdit ? 'Dealer updated successfully.' : 'Dealer created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save dealer.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    dealer: dealerResult.data,
    mrOptions: mrOptionsResult.data ?? [],
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
