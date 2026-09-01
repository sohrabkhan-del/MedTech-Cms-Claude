import {
  useGetGeoFencesQuery,
  useGetGeoFenceAnalyticsCardsQuery,
} from '@/features/fieldOperations/services/geoFencesApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type { GeoFence } from '@/types/geoFence'

export function useGeoFences(
  userType?: 'Dealer' | 'Chemist',
  search?: string,
  page?: number,
  limit?: number,
  zone?: 'North' | 'South' | 'East' | 'West',
  status?: 'active' | 'pending' | 'inactive',
) {
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
    page,
    limit,
    zone,
    status,
  })
  const analyticsCardsResult = useGetGeoFenceAnalyticsCardsQuery({
    ...analyticsParams,
    regionId: effectiveRegionId,
    userType,
  })

  const isLoading = geoFencesResult.isFetching
  const isAnalyticsCardsLoading = analyticsCardsResult.isFetching
  const error = geoFencesResult.error
    ? getApiErrorMessage(geoFencesResult.error, 'Failed to load geo fences.')
    : analyticsCardsResult.error
      ? getApiErrorMessage(
          analyticsCardsResult.error,
          'Failed to load geo fences.',
        )
      : null

  const pagedGeoFences = geoFencesResult.data ?? []
  const totalCount =
    (pagedGeoFences as (GeoFence[] & { totalItems?: number }) | undefined)
      ?.totalItems ?? pagedGeoFences.length

  return {
    geoFences: pagedGeoFences,
    totalCount,
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
