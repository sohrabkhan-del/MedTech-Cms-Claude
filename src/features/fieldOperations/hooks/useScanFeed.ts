import { useGetScanEventsQuery, useGetScanFeedKpisQuery } from '@/features/fieldOperations/services/scanFeedApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Initial scan-feed page + KPIs. See useLiveScanFeed for the real-time-updating variant. */
export function useScanFeed() {
  const scanEventsResult = useGetScanEventsQuery()
  const kpisResult = useGetScanFeedKpisQuery()

  const isLoading = scanEventsResult.isLoading || kpisResult.isLoading
  const error = scanEventsResult.error
    ? getApiErrorMessage(scanEventsResult.error, 'Failed to load scan feed.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load scan feed.')
      : null

  return {
    scanEvents: scanEventsResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
