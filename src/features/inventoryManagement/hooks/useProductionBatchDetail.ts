import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetProductionBatchDetailQuery } from '@/features/inventoryManagement/services/productBatchesApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useProductionBatchDetail(batchId: string | undefined) {
  const { data: batch, isLoading, error: queryError } = useGetProductionBatchDetailQuery(batchId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load production batch.') : null

  return { batch, isLoading, error }
}
