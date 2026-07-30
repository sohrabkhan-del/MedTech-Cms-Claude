import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetFactoryBatchDetailQuery,
  useGetContainerDetailQuery,
} from '@/features/inventoryManagement/services/factoryUploadApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useContainerDetail(batchId: string | undefined, containerId: string | undefined) {
  const batchResult = useGetFactoryBatchDetailQuery(batchId ?? skipToken)
  const containerResult = useGetContainerDetailQuery(batchId && containerId ? { batchId, containerId } : skipToken)

  const isLoading = batchResult.isLoading || containerResult.isLoading
  const error = batchResult.error
    ? getApiErrorMessage(batchResult.error, 'Failed to load container.')
    : containerResult.error
      ? getApiErrorMessage(containerResult.error, 'Failed to load container.')
      : null

  return {
    batch: batchResult.data,
    container: containerResult.data,
    isLoading,
    error,
  }
}
