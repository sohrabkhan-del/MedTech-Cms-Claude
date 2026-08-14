import {
  useGetWalletPartnersQuery,
  type WalletPartnersQueryParams,
} from '@/features/rewardsWallet/services/walletPartnersApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useWalletPartners(params?: WalletPartnersQueryParams) {
  const { regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const effectiveRegionId = params?.regionId || topbarRegionId || undefined

  const result = useGetWalletPartnersQuery({
    ...params,
    ...analyticsParams,
    regionId: effectiveRegionId,
  })

  return {
    wallets: result.data?.items ?? [],
    totalItems: result.data?.totalItems ?? 0,
    isLoading: result.isFetching,
    error: result.error ? getApiErrorMessage(result.error, 'Failed to load wallets.') : null,
  }
}
