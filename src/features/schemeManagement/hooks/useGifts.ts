import {
  useGetGiftsQuery,
  useGetGiftCatalogueKpisQuery,
} from '@/features/schemeManagement/services/giftsApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type { GiftQueryParams } from '@/features/schemeManagement/services/giftsApi'

export function useGifts(
  paramsOverride?: Pick<GiftQueryParams, 'sortBy' | 'sortOrder' | 'search'>,
) {
  const { regionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const params = {
    ...analyticsParams,
    regionId: regionId || undefined,
    page: 1,
    limit: 10,
    sortBy: paramsOverride?.sortBy,
    sortOrder: paramsOverride?.sortOrder ?? 'desc',
    search: paramsOverride?.search || undefined,
  }
  const giftsResult = useGetGiftsQuery(params)
  const kpisResult = useGetGiftCatalogueKpisQuery(params)

  const isLoading =
    giftsResult.isLoading ||
    giftsResult.isFetching ||
    kpisResult.isLoading ||
    kpisResult.isFetching
  const error = giftsResult.error
    ? getApiErrorMessage(giftsResult.error, 'Failed to load gifts.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load gifts.')
      : null

  return {
    gifts: giftsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
