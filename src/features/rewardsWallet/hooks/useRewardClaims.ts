import {
  useGetRewardClaimsQuery,
  useGetRewardClaimsKpisQuery,
  type RewardClaimsQueryParams,
} from '@/features/rewardsWallet/services/rewardClaimsApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const ALL_INDIA_REGION = 'All India'

export function useRewardClaims(params?: Pick<RewardClaimsQueryParams, 'status' | 'search'>) {
  const { region, regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const effectiveRegionId =
    region === ALL_INDIA_REGION ? undefined : (topbarRegionId ?? undefined)

  const queryParams: RewardClaimsQueryParams = {
    ...analyticsParams,
    regionId: effectiveRegionId,
    status: params?.status,
    search: params?.search,
  }

  const claimsResult = useGetRewardClaimsQuery(queryParams)
  const kpisResult = useGetRewardClaimsKpisQuery(queryParams)

  const isLoading = claimsResult.isFetching || kpisResult.isFetching
  const error = claimsResult.error
    ? getApiErrorMessage(claimsResult.error, 'Failed to load reward redemptions.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load reward redemption stats.')
      : null

  return {
    claims: claimsResult.data?.items ?? [],
    totalItems: claimsResult.data?.totalItems ?? 0,
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
