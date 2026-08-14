import {
  useGetProductPointRulesQuery,
  useGetPointValueRulesKpisQuery,
} from '@/features/rewardsWallet/services/pointValueRulesApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const ALL_INDIA_REGION = 'All India'

export function useProductPointRules(regionIdOverride?: string) {
  const { region, regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const topbarEffectiveRegionId =
    region === ALL_INDIA_REGION ? undefined : (topbarRegionId ?? undefined)
  const effectiveRegionId = regionIdOverride || topbarEffectiveRegionId

  const rulesResult = useGetProductPointRulesQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
  })
  const kpisResult = useGetPointValueRulesKpisQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
  })

  const isLoading = rulesResult.isFetching || kpisResult.isFetching
  const error = rulesResult.error
    ? getApiErrorMessage(rulesResult.error, 'Failed to load point value rules.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load point value rule stats.')
      : null

  return {
    rules: rulesResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
