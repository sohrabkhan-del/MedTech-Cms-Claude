import {
  useGetChemistsQuery,
  type ChemistQueryParams,
} from '@/features/userManagement/services/chemistApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemists(params?: ChemistQueryParams) {
  const chemistsResult = useGetChemistsQuery(params)
  const chemists = chemistsResult.data ?? []

  const isLoading = chemistsResult.isLoading
  const error = chemistsResult.error
    ? getApiErrorMessage(chemistsResult.error, 'Failed to load chemists.')
    : null

  return {
    chemists,
    kpis: {
      totalChemists: chemists.length,
      activeChemists: chemists.filter((chemist) => chemist.status === 'active')
        .length,
      inactiveChemists: chemists.filter(
        (chemist) => chemist.status === 'inactive',
      ).length,
      pendingApproval: chemists.filter(
        (chemist) => chemist.status === 'pending',
      ).length,
    },
    isLoading,
    error,
  }
}
