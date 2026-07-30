import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetMedicalRepDetailQuery,
  useGetMedicalRepFormOptionsQuery,
  useCreateMedicalRepMutation,
  useUpdateMedicalRepMutation,
} from '@/features/systemUsers/services/medicalRepsApi'
import type { MedicalRepFormValues } from '@/features/systemUsers/types/systemUsers.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMedicalRepForm(mrId: string | undefined) {
  const isEdit = !!mrId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const mrResult = useGetMedicalRepDetailQuery(mrId ?? skipToken)
  const optionsResult = useGetMedicalRepFormOptionsQuery()
  const [createMedicalRep] = useCreateMedicalRepMutation()
  const [updateMedicalRep] = useUpdateMedicalRepMutation()

  const isLoading = (isEdit && mrResult.isLoading) || optionsResult.isLoading
  const loadError = mrResult.error
    ? getApiErrorMessage(mrResult.error, 'Failed to load medical representative form data.')
    : optionsResult.error
      ? getApiErrorMessage(optionsResult.error, 'Failed to load medical representative form data.')
      : null

  async function submit(values: MedicalRepFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && mrId) {
        await updateMedicalRep({ id: mrId, values }).unwrap()
      } else {
        await createMedicalRep(values).unwrap()
      }
      toast.success(isEdit ? 'Medical rep updated successfully.' : 'Medical rep created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save medical representative.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    mr: mrResult.data,
    options: optionsResult.data ?? null,
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
