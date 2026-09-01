import {
  useGetScanEventsQuery,
  type ScanFeedQueryParams,
} from '@/features/fieldOperations/services/scanFeedApi'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useScanFeed(
  params?: ScanFeedQueryParams,
  pollingIntervalMs = 0,
) {
  const { regionId: topbarRegionId, dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const { preset, startDate, endDate } = analyticsParams
  const effectiveRegionId = params?.regionId || topbarRegionId || undefined

  const scanEventsResult = useGetScanEventsQuery(
    {
      ...params,
      regionId: effectiveRegionId,
      preset,
      startDate,
      endDate,
    },
    {
      pollingInterval: pollingIntervalMs,
    },
  )

  const isLoading = scanEventsResult.isFetching
  const error = scanEventsResult.error
    ? getApiErrorMessage(scanEventsResult.error, 'Failed to load scan feed.')
    : null

  return {
    scanEvents: scanEventsResult.data?.items ?? [],
    totalItems: scanEventsResult.data?.totalItems ?? 0,
    isLoading,
    error,
  }
}
