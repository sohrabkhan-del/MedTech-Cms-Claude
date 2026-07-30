import {
  useGetMedicalRepsQuery,
  type MedicalRepQueryParams,
} from '@/features/systemUsers/services/medicalRepsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMedicalReps(params?: MedicalRepQueryParams) {
  const medicalRepsResult = useGetMedicalRepsQuery(params)
  const medicalReps = medicalRepsResult.data ?? []

  const isLoading = medicalRepsResult.isLoading
  const error = medicalRepsResult.error
    ? getApiErrorMessage(medicalRepsResult.error, 'Failed to load medical representatives.')
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
