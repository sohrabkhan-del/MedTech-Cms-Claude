import { useCallback } from 'react'
import {
  useGetProductionBatchesQuery,
  useGetProductionBatchKpisQuery,
  useImportUploadedBatchesMutation,
} from '@/features/inventoryManagement/services/productBatchesApi'
import type { MappedBatch } from '@/types/batchUidUpload'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/**
 * Production batches (the "Batch Listing" tab). Starts empty — rows only appear once a
 * Batch & UID Upload (Upload Manifest) has been completed in this session.
 */
export function useProductBatches() {
  const batchesResult = useGetProductionBatchesQuery()
  const kpisResult = useGetProductionBatchKpisQuery()
  const [importUploadedBatchesMutation] = useImportUploadedBatchesMutation()

  const isLoading = batchesResult.isLoading || kpisResult.isLoading
  const error = batchesResult.error
    ? getApiErrorMessage(batchesResult.error, 'Failed to load product batches.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load product batches.')
      : null

  const importManifest = useCallback(
    async (mappedBatches: MappedBatch[], uploadFileName: string) => {
      await importUploadedBatchesMutation({ mappedBatches, uploadFileName }).unwrap()
    },
    [importUploadedBatchesMutation],
  )

  return {
    batches: batchesResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
    importManifest,
  }
}
