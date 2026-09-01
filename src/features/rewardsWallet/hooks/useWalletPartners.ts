import {
  useGetWalletPartnersQuery,
  type WalletPartnersQueryParams,
} from '@/features/rewardsWallet/services/walletPartnersApi'
import { useGetWalletKpisQuery } from '@/features/rewardsWallet/services/walletsApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const ALL_INDIA_REGION = 'All India'

export function useWalletPartners(params?: WalletPartnersQueryParams) {
  const { region, regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const topbarEffectiveRegionId =
    region === ALL_INDIA_REGION ? undefined : (topbarRegionId ?? undefined)
  const effectiveRegionId = params?.regionId || topbarEffectiveRegionId

  const queryParams = {
    ...params,
    ...analyticsParams,
    regionId: effectiveRegionId,
  }
  const result = useGetWalletPartnersQuery(queryParams)

  const kpisResult = useGetWalletKpisQuery({
    regionId: effectiveRegionId,
    type: params?.type,
    ...analyticsParams,
  })

  const kpis = kpisResult.data ?? {
    totalWalletBalance: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    pendingRedemptions: 0,
    pointsCredited: 0,
    pointsCreditedChange: 0,
    pointsDebited: 0,
    pointsDebitedChange: 0,
    manualAdminCredits: 0,
    manualAdminCreditsChange: 0,
  }

  return {
    wallets: result.data?.items ?? [],
    totalItems: result.data?.totalItems ?? 0,
    kpis,
    // consider both queries' fetching state for UI shimmer consistency
    isLoading: result.isFetching || kpisResult.isFetching,
    error: result.error
      ? getApiErrorMessage(result.error, 'Failed to load wallets.')
      : kpisResult.error
        ? getApiErrorMessage(kpisResult.error, 'Failed to load wallet KPIs.')
        : null,
  }
}
