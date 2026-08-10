import { useEffect } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { useGetFactoryProductionUploadRowsByBatchQuery } from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Looks up rows for one batch number via GET /products/upload-rows/batch/{batchNo}, on demand. */
export function useFactoryProductionUploadRows(batchNo: string) {
  const {
    data: rows,
    isFetching,
    error: queryError,
  } = useGetFactoryProductionUploadRowsByBatchQuery(batchNo || skipToken)

  useEffect(() => {
    if (rows) console.log(`GET /products/upload-rows/batch/${batchNo} response:`, rows)
  }, [rows, batchNo])

  const error = queryError ? getApiErrorMessage(queryError, 'Failed to load batch rows.') : null

  return { rows: rows ?? [], isFetching, error }
}
