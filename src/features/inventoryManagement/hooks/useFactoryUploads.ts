import { useCallback } from 'react'
import {
  useGetFactoryBatchesQuery,
  useGetFactoryUploadKpisQuery,
  useImportBmrUploadMutation,
} from '@/features/inventoryManagement/services/factoryUploadApi'
import type { BmrBatchRow } from '@/types/batchUidUpload'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useFactoryUploads() {
  const batchesResult = useGetFactoryBatchesQuery()
  const kpisResult = useGetFactoryUploadKpisQuery()
  const [importBmrUploadMutation] = useImportBmrUploadMutation()

  const isLoading = batchesResult.isLoading || kpisResult.isLoading
  const error = batchesResult.error
    ? getApiErrorMessage(batchesResult.error, 'Failed to load factory uploads.')
    : kpisResult.error
      ? getApiErrorMessage(kpisResult.error, 'Failed to load factory uploads.')
      : null

  const importBmrUpload = useCallback(
    async (batchRows: BmrBatchRow[], uploadFileName: string, containerCountByBatch: Record<string, number>) => {
      await importBmrUploadMutation({ batchRows, uploadFileName, containerCountByBatch }).unwrap()
    },
    [importBmrUploadMutation],
  )

  return {
    batches: batchesResult.data ?? [],
    kpis: kpisResult.data ?? null,
    isLoading,
    error,
    importBmrUpload,
  }
}
