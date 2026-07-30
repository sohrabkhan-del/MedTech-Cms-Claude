import { useGetDealersQuery, useGetDealerKpisQuery } from '@/features/userManagement/services/partnersApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDealers() {
  const dealersResult = useGetDealersQuery()
  const kpisResult = useGetDealerKpisQuery()

  const isLoading = dealersResult.isLoading || kpisResult.isLoading
  const error = dealersResult.error
    ? getApiErrorMessage(dealersResult.error, 'Failed to load dealers.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load dealers.')
      : null

  return {
    dealers: dealersResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
