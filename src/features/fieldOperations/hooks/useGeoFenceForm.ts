import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetGeoFenceDetailQuery,
  useGetGeoFenceUserOptionsQuery,
  useCreateGeoFenceMutation,
  useUpdateGeoFenceMutation,
} from '@/features/fieldOperations/services/geoFencesApi'
import type { GeoFenceFormValues } from '@/features/fieldOperations/types/fieldOperations.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useGeoFenceForm(fenceId: string | undefined) {
  const isEdit = !!fenceId
  const toast = useToast()

  const { data: fence, isLoading: isFenceLoading, error: fenceError } = useGetGeoFenceDetailQuery(fenceId ?? skipToken)
  const { data: userOptions, isLoading: isOptionsLoading, error: optionsError } = useGetGeoFenceUserOptionsQuery()

  const [createGeoFenceMutation, { isLoading: isCreating }] = useCreateGeoFenceMutation()
  const [updateGeoFenceMutation, { isLoading: isUpdating }] = useUpdateGeoFenceMutation()

  const isLoading = isFenceLoading || isOptionsLoading
  const isSubmitting = isCreating || isUpdating

  const loadError = fenceError
    ? getApiErrorMessage(fenceError, 'Failed to load geo fence form data.')
    : optionsError
      ? getApiErrorMessage(optionsError, 'Failed to load geo fence form data.')
      : null

  async function submit(values: GeoFenceFormValues) {
    try {
      if (isEdit && fenceId) {
        await updateGeoFenceMutation({ id: fenceId, values }).unwrap()
      } else {
        await createGeoFenceMutation(values).unwrap()
      }
      toast.success(isEdit ? 'Geo fence updated successfully.' : 'Geo fence created successfully.')
      return true
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save geo fence.')
      toast.error(message)
      return false
    }
  }

  return {
    isEdit,
    fence,
    userOptions: userOptions ?? [],
    isLoading,
    loadError,
    isSubmitting,
    error: loadError,
    submit,
  }
}
