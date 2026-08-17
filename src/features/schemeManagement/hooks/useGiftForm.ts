import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetGiftDetailQuery,
  useGetGiftFormOptionsQuery,
  useGetGiftRegionOptionsQuery,
  useCreateGiftMutation,
  useUpdateGiftMutation,
} from '@/features/schemeManagement/services/giftsApi'
import type { GiftFormValues } from '@/features/schemeManagement/types/schemeManagement.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useGiftForm(giftId: string | undefined) {
  const isEdit = !!giftId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const giftResult = useGetGiftDetailQuery(giftId ?? skipToken)
  const optionsResult = useGetGiftFormOptionsQuery()
  const regionsResult = useGetGiftRegionOptionsQuery()
  const [createGift] = useCreateGiftMutation()
  const [updateGift] = useUpdateGiftMutation()

  const options = optionsResult.data
    ? {
        ...optionsResult.data,
        regionOptions: regionsResult.data ?? [],
      }
    : null

  const isLoading =
    (isEdit && giftResult.isLoading) ||
    optionsResult.isLoading ||
    regionsResult.isLoading
  const loadError = giftResult.error
    ? getApiErrorMessage(giftResult.error, 'Failed to load gift form data.')
    : optionsResult.error
      ? getApiErrorMessage(optionsResult.error, 'Failed to load gift form data.')
      : regionsResult.error
        ? getApiErrorMessage(regionsResult.error, 'Failed to load gift form data.')
        : null

  async function submit(values: GiftFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && giftId) {
        await updateGift({ id: giftId, values }).unwrap()
      } else {
        await createGift(values).unwrap()
      }
      toast.success(isEdit ? 'Gift updated successfully.' : 'Gift created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save gift.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    gift: giftResult.data,
    options,
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
