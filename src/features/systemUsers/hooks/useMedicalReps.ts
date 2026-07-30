import { useGetMedicalRepsQuery, useGetMedicalRepKpisQuery } from '@/features/systemUsers/services/medicalRepsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useMedicalReps() {
  const medicalRepsResult = useGetMedicalRepsQuery()
  const kpisResult = useGetMedicalRepKpisQuery()

  const isLoading = medicalRepsResult.isLoading || kpisResult.isLoading
  const error = medicalRepsResult.error
    ? getApiErrorMessage(medicalRepsResult.error, 'Failed to load medical representatives.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load medical representatives.')
      : null

  return {
    medicalReps: medicalRepsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
