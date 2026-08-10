import {
  useGetScanEventsQuery,
  type ScanFeedQueryParams,
} from '@/features/fieldOperations/services/scanFeedApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useScanFeed(params?: ScanFeedQueryParams, pollingIntervalMs = 0) {
  const scanEventsResult = useGetScanEventsQuery(params, {
    pollingInterval: pollingIntervalMs,
  })

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
