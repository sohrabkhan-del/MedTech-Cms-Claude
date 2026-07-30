import {
  useGetProductBatchesQuery,
  useGetProductBatchKpisQuery,
} from '@/features/inventoryManagement/services/productBatchesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Backs the "Scanning Products" tab on the Product Batches page. */
export function useScanningProducts() {
  const batchesResult = useGetProductBatchesQuery()
  const kpisResult = useGetProductBatchKpisQuery()

  const isLoading = batchesResult.isLoading || kpisResult.isLoading
  const error = batchesResult.error
    ? getApiErrorMessage(batchesResult.error, 'Failed to load scanning products.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load scanning products.')
      : null

  return {
    batches: batchesResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
  }
}
