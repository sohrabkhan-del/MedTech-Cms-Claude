import { useGetChemistsQuery, useGetChemistKpisQuery } from '@/features/userManagement/services/chemistApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemists() {
  const chemistsResult = useGetChemistsQuery()
  const kpisResult = useGetChemistKpisQuery()

  const isLoading = chemistsResult.isLoading || kpisResult.isLoading
  const error = chemistsResult.error
    ? getApiErrorMessage(chemistsResult.error, 'Failed to load chemists.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load chemists.')
      : null

  return {
    chemists: chemistsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
