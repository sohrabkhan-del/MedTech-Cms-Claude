import {
  useGetProductPointRulesQuery,
  useGetPointValueRulesKpisQuery,
} from '@/features/rewardsWallet/services/pointValueRulesApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const ALL_INDIA_REGION = 'All India'

export function useProductPointRules(
  regionIdOverride?: string,
  partnerType?: 'Dealer' | 'Chemist',
  page = 1,
  limit = 20,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
) {
  const { region, regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const topbarEffectiveRegionId =
    region === ALL_INDIA_REGION ? undefined : (topbarRegionId ?? undefined)
  const effectiveRegionId = regionIdOverride || topbarEffectiveRegionId

  const rulesResult = useGetProductPointRulesQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
    type: partnerType,
    page,
    limit,
    sortBy,
    sortOrder,
  })
  const kpisResult = useGetPointValueRulesKpisQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
    type: partnerType,
  })
  const isLoading =
    rulesResult.isLoading || rulesResult.isFetching || kpisResult.isFetching
  const error = rulesResult.error
    ? getApiErrorMessage(rulesResult.error, 'Failed to load point value rules.')
    : kpisResult.error
      ? getApiErrorMessage(
          kpisResult.error,
          'Failed to load point value rule stats.',
        )
      : null

  return {
    rules: rulesResult.data?.items ?? [],
    totalItems: rulesResult.data?.totalItems ?? 0,
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
