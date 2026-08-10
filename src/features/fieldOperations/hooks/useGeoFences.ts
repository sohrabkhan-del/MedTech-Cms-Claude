import {
  useGetGeoFencesQuery,
  useGetGeoFenceAnalyticsCardsQuery,
} from '@/features/fieldOperations/services/geoFencesApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useGeoFences(userType?: 'Dealer' | 'Chemist', search?: string) {
  const { regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const { preset, startDate, endDate } = analyticsParams

  const effectiveRegionId = topbarRegionId || undefined

  const geoFencesResult = useGetGeoFencesQuery({
    regionId: effectiveRegionId,
    preset,
    startDate,
    endDate,
    userType,
    search,
  })
  const analyticsCardsResult = useGetGeoFenceAnalyticsCardsQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
  })

  const isLoading = geoFencesResult.isLoading
  const isAnalyticsCardsLoading = analyticsCardsResult.isLoading
  const error = geoFencesResult.error
    ? getApiErrorMessage(geoFencesResult.error, 'Failed to load geo fences.')
    : analyticsCardsResult.error
      ? getApiErrorMessage(analyticsCardsResult.error, 'Failed to load geo fences.')
      : null

  return {
    geoFences: geoFencesResult.data ?? [],
    analyticsCards: analyticsCardsResult.data ?? null,
    isLoading,
    isAnalyticsCardsLoading,
    error,
    refetch: async () => {
      await Promise.all([
        geoFencesResult.refetch(),
        analyticsCardsResult.refetch(),
      ])
    },
  }
}
