import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetChemistDetailQuery } from '@/features/userManagement/services/chemistApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useChemistDetail(chemistId: string | undefined) {
  const { data: chemist, isLoading, error: queryError } = useGetChemistDetailQuery(chemistId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load chemist.') : null

  return { chemist, isLoading, error }
}
