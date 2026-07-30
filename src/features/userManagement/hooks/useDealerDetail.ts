import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetDealerDetailQuery } from '@/features/userManagement/services/partnersApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDealerDetail(dealerId: string | undefined) {
  const { data: dealer, isLoading, error: queryError } = useGetDealerDetailQuery(dealerId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load dealer.') : null

  return { dealer, isLoading, error }
}
