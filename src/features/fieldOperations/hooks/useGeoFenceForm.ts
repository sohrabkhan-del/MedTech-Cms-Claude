import { skipToken } from '@reduxjs/toolkit/query/react'
import { useToast } from '@/contexts/ToastContext'
import {
  useGetGeoFencesQuery,
  useGetGeoFenceUserOptionsQuery,
  useCreateGeoFenceMutation,
} from '@/features/fieldOperations/services/geoFencesApi'
import { useGetGeoFenceSettingsQuery } from '@/features/fieldOperations/services/geoFenceSettingsApi'
import {
  useUpdateDealerGeoFenceMutation,
} from '@/features/userManagement/services/dealerApi'
import {
  useUpdateChemistGeoFenceMutation,
} from '@/features/userManagement/services/chemistApi'
import type { GeoFenceFormValues } from '@/features/fieldOperations/types/fieldOperations.types'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useGeoFenceForm(fenceId: string | undefined, scope: 'global' | 'user' = 'user') {
  const isEdit = !!fenceId
  const isGlobal = scope === 'global' && !isEdit
  const toast = useToast()

  const { data: geoFences, isLoading: isFencesLoading, error: fencesError } = useGetGeoFencesQuery(
    isEdit ? undefined : skipToken,
  )
  const fence = isEdit ? geoFences?.find((item) => item.id === fenceId) : undefined

  const { data: userOptions, isLoading: isOptionsLoading, error: optionsError } = useGetGeoFenceUserOptionsQuery(
    isGlobal || isEdit ? skipToken : undefined,
  )
  const { data: settings, isLoading: isSettingsLoading, error: settingsError } = useGetGeoFenceSettingsQuery(
    isGlobal ? undefined : skipToken,
  )

  const [createGeoFenceMutation, { isLoading: isCreating }] = useCreateGeoFenceMutation()
  const [updateDealerGeoFenceMutation, { isLoading: isUpdatingDealer }] = useUpdateDealerGeoFenceMutation()
  const [updateChemistGeoFenceMutation, { isLoading: isUpdatingChemist }] = useUpdateChemistGeoFenceMutation()

  const isLoading = isGlobal ? isSettingsLoading : isEdit ? isFencesLoading : isOptionsLoading
  const isSubmitting = isCreating || isUpdatingDealer || isUpdatingChemist

  const loadError = isGlobal
    ? settingsError
      ? getApiErrorMessage(settingsError, 'Failed to load geo fence settings.')
      : null
    : isEdit
      ? fencesError
        ? getApiErrorMessage(fencesError, 'Failed to load geo fence form data.')
        : null
      : optionsError
        ? getApiErrorMessage(optionsError, 'Failed to load geo fence form data.')
        : null

  async function submit(values: GeoFenceFormValues) {
    try {
      if (isEdit && fenceId) {
        if (!fence?.businessId) throw new Error('Missing business reference for this geo fence.')
        const payload = {
          id: fenceId,
          businessId: fence.businessId,
          scanRadius: Number(values.radiusMeters),
          bufferRadius: Number(values.bufferDistanceMeters),
        }
        if (fence.userType === 'Dealer') {
          await updateDealerGeoFenceMutation(payload).unwrap()
        } else if (fence.userType === 'Chemist') {
          await updateChemistGeoFenceMutation(payload).unwrap()
        } else {
          throw new Error('Geo fences can only be edited for Dealers and Chemists.')
        }
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
    settings: settings ?? [],
    isLoading,
    loadError,
    isSubmitting,
    error: loadError,
    submit,
  }
}
