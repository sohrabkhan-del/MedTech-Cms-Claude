import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  useGetFactoryBatchDetailQuery,
  useGetContainerDetailQuery,
  useGetBoxDetailQuery,
} from '@/features/inventoryManagement/services/factoryUploadApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function useBoxDetail(batchId: string | undefined, containerId: string | undefined, boxId: string | undefined) {
  const batchResult = useGetFactoryBatchDetailQuery(batchId ?? skipToken)
  const containerResult = useGetContainerDetailQuery(batchId && containerId ? { batchId, containerId } : skipToken)
  const boxResult = useGetBoxDetailQuery(batchId && containerId && boxId ? { batchId, containerId, boxId } : skipToken)

  const isLoading = batchResult.isLoading || containerResult.isLoading || boxResult.isLoading
  const error = batchResult.error
    ? getApiErrorMessage(batchResult.error, 'Failed to load box.')
    : containerResult.error
      ? getApiErrorMessage(containerResult.error, 'Failed to load box.')
      : boxResult.error
        ? getApiErrorMessage(boxResult.error, 'Failed to load box.')
        : null

  return {
    batch: batchResult.data,
    container: containerResult.data,
    box: boxResult.data,
    isLoading,
    error,
  }
}
