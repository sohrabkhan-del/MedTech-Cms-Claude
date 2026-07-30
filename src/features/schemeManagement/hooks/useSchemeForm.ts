import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetSchemeDetailQuery,
  useGetSchemeFormOptionsQuery,
  useCreateSchemeMutation,
  useUpdateSchemeMutation,
  useLazyCheckSchemeNameAvailableQuery,
} from '@/features/schemeManagement/services/schemesApi'
import type { SchemeFormValues } from '@/features/schemeManagement/types/schemeManagement.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useSchemeForm(schemeId: string | undefined, cloneFromId: string | null) {
  const isEdit = !!schemeId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schemeResult = useGetSchemeDetailQuery(schemeId ?? skipToken)
  const cloneSourceResult = useGetSchemeDetailQuery(!schemeId && cloneFromId ? cloneFromId : skipToken)
  const optionsResult = useGetSchemeFormOptionsQuery()
  const [createScheme] = useCreateSchemeMutation()
  const [updateScheme] = useUpdateSchemeMutation()
  const [checkNameAvailable] = useLazyCheckSchemeNameAvailableQuery()

  const isLoading =
    (isEdit && schemeResult.isLoading) ||
    (!isEdit && !!cloneFromId && cloneSourceResult.isLoading) ||
    optionsResult.isLoading
  const loadError = schemeResult.error
    ? getApiErrorMessage(schemeResult.error, 'Failed to load scheme form data.')
    : cloneSourceResult.error
      ? getApiErrorMessage(cloneSourceResult.error, 'Failed to load scheme form data.')
      : optionsResult.error
        ? getApiErrorMessage(optionsResult.error, 'Failed to load scheme form data.')
        : null

  async function submit(values: SchemeFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const nameAvailable = await checkNameAvailable({ name: values.name, excludeId: schemeId }).unwrap()
      if (!nameAvailable) {
        const message = 'A scheme with this name already exists.'
        setSubmitError(message)
        toast.error(message)
        return false
      }

      if (isEdit && schemeId) {
        await updateScheme({ id: schemeId, values }).unwrap()
      } else {
        await createScheme(values).unwrap()
      }
      toast.success(isEdit ? 'Scheme updated successfully.' : 'Scheme created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save scheme.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    scheme: schemeResult.data,
    cloneSource: cloneSourceResult.data,
    options: optionsResult.data ?? null,
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
