import { useCallback, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { useUploadFactoryProductionRowsMutation } from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { parseFactoryProductionFile } from '@/features/inventoryManagement/factoryProductionUploadParser'
import type { FactoryProductionUploadBatch } from '@/types/factoryProductionUpload'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Parses a single .xls/.xlsx file client-side, then POSTs its rows to /products/upload as-is. */
export function useFactoryProductionUpload() {
  const toast = useToast()
  const [uploadRows, { isLoading: isUploading }] = useUploadFactoryProductionRowsMutation()
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(
    async (file: File): Promise<FactoryProductionUploadBatch | null> => {
      setError(null)
      try {
        const rows = await parseFactoryProductionFile(file)
        const batch = await uploadRows({ rows }).unwrap()
        console.log('POST /products/upload response:', batch)
        toast.success('File uploaded successfully.')
        return batch
      } catch (err) {
        const message = getApiErrorMessage(err, 'Upload failed. Please try again.')
        setError(message)
        toast.error(message)
        return null
      }
    },
    [uploadRows, toast],
  )

  return { uploadFile, isUploading, error }
}
