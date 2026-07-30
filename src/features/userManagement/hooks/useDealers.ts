import {
  useGetDealersQuery,
  type DealerQueryParams,
} from '@/features/userManagement/services/dealerApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useDealers(params?: DealerQueryParams) {
  const dealersResult = useGetDealersQuery(params)
  const dealers = dealersResult.data ?? []

  const isLoading = dealersResult.isLoading
  const error = dealersResult.error
    ? getApiErrorMessage(dealersResult.error, 'Failed to load dealers.')
    : null

  return {
    dealers,
    kpis: {
      totalDealers: dealers.length,
      activeDealers: dealers.filter((dealer) => dealer.status === 'active')
        .length,
      inactiveDealers: dealers.filter(
        (dealer) => dealer.status === 'inactive',
      ).length,
      pendingApproval: dealers.filter((dealer) => dealer.status === 'pending')
        .length,
    },
    isLoading,
    error,
  }
}
