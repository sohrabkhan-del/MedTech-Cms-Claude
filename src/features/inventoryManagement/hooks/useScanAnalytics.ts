import { useGetScanAnalyticsRowsQuery } from '@/features/inventoryManagement/services/productBatchesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useScanAnalytics() {
  const { data, isLoading, error: queryError } = useGetScanAnalyticsRowsQuery()
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load scan analytics.') : null

  return { rows: data ?? [], isLoading, error }
}
