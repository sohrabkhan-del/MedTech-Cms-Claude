import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetFactoryBatchDetailQuery } from '@/features/inventoryManagement/services/factoryUploadApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useFactoryBatchDetail(batchId: string | undefined) {
  const { data: batch, isLoading, error: queryError } = useGetFactoryBatchDetailQuery(batchId ?? skipToken)
  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load factory batch.') : null

  return { batch, isLoading, error }
}
