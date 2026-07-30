import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetAdminDetailQuery,
  useGetAdminFormOptionsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
} from '@/features/systemUsers/services/adminsApi'
import type { AdminFormValues } from '@/features/systemUsers/types/systemUsers.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useAdminForm(adminId: string | undefined) {
  const isEdit = !!adminId
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const adminResult = useGetAdminDetailQuery(adminId ?? skipToken)
  const optionsResult = useGetAdminFormOptionsQuery()
  const [createAdmin] = useCreateAdminMutation()
  const [updateAdmin] = useUpdateAdminMutation()

  const isLoading = (isEdit && adminResult.isLoading) || optionsResult.isLoading
  const loadError = adminResult.error
    ? getApiErrorMessage(adminResult.error, 'Failed to load admin form data.')
    : optionsResult.error
      ? getApiErrorMessage(optionsResult.error, 'Failed to load admin form data.')
      : null

  async function submit(values: AdminFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && adminId) {
        await updateAdmin({ id: adminId, values }).unwrap()
      } else {
        await createAdmin(values).unwrap()
      }
      toast.success(isEdit ? 'Admin updated successfully.' : 'Admin created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save admin.')
      setSubmitError(message)
      toast.error(message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isEdit,
    admin: adminResult.data,
    options: optionsResult.data ?? null,
    isLoading,
    isSubmitting,
    error: loadError ?? submitError,
    submit,
  }
}
