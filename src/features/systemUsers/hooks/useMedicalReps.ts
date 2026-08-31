import {
  useGetMedicalRepsQuery,
  type MedicalRepQueryParams,
} from '@/features/systemUsers/services/medicalRepsApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMedicalReps(params?: MedicalRepQueryParams) {
  const { regionId: topbarRegionId } = useRegionFilter()
  const effectiveRegionId = params?.regionId || topbarRegionId || undefined

  const medicalRepsResult = useGetMedicalRepsQuery({
    ...params,
    regionId: effectiveRegionId,
  })
  const medicalReps = medicalRepsResult.data ?? []

  // Treat background fetching as loading for UI shimmer consistency
  const isLoading = medicalRepsResult.isLoading || medicalRepsResult.isFetching
  const error = medicalRepsResult.error
    ? getApiErrorMessage(
        medicalRepsResult.error,
        'Failed to load medical representatives.',
      )
    : null

  return {
    medicalReps,
    kpis: {
      totalMrs: medicalReps.length,
      activeMrs: medicalReps.filter((mr) => mr.status === 'active').length,
      pendingMrs: medicalReps.filter((mr) => mr.status === 'pending').length,
      inactiveMrs: medicalReps.filter((mr) => mr.status === 'inactive').length,
    },
    isLoading,
    error,
  }
}
