import { useEffect } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetFactoryProductionUploadBatchQuery } from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Loads the /products/upload/{id} summary record for this upload event. */
export function useFactoryProductionUploadDetail(uploadId: string | undefined) {
  const { data: batch, isLoading, error: queryError } = useGetFactoryProductionUploadBatchQuery(
    uploadId ?? skipToken,
  )

  useEffect(() => {
    if (batch) console.log('GET /products/upload/{id} response:', batch)
  }, [batch])

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load upload batch.') : null

  return { batch, isLoading, error }
}
