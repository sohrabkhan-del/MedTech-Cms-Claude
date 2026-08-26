import { useCallback, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import {
  usePreviewFactoryProductionRowsMutation,
  useUploadFactoryProductionRowsMutation,
} from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { parseFactoryProductionFile } from '@/features/inventoryManagement/factoryProductionUploadParser'
import type {
  FactoryProductionUploadBatch,
  FactoryProductionUploadPreview,
  FactoryProductionUploadRow,
} from '@/types/factoryProductionUpload'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Parses a single .xls/.xlsx file client-side, then POSTs its rows to /products/upload as-is. */
export function useFactoryProductionUpload() {
  const toast = useToast()
  const [previewRows, { isLoading: isPreviewing }] =
    usePreviewFactoryProductionRowsMutation()
  const [uploadRows, { isLoading: isUploading }] =
    useUploadFactoryProductionRowsMutation()
  const [error, setError] = useState<string | null>(null)

  const previewFile = useCallback(
    async (file: File): Promise<FactoryProductionUploadPreview | null> => {
      setError(null)
      try {
        const rows = await parseFactoryProductionFile(file)
        console.log('Parsed upload file, rows:', rows.length, rows[0])
        const preview = await previewRows({ rows }).unwrap()
        console.log('Preview response:', preview)
        return preview
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          'Preview failed. Please try again.',
        )
        setError(message)
        toast.error(message)
        return null
      }
    },
    [previewRows, toast],
  )

  const uploadRowsFromPreview = useCallback(
    async (
      rows: FactoryProductionUploadRow[],
    ): Promise<FactoryProductionUploadBatch | null> => {
      setError(null)
      try {
        console.log('Uploading rows (count):', rows.length)
        const batch = await uploadRows({ rows }).unwrap()
        console.log('POST /products/upload response:', batch)
        toast.success('File uploaded successfully.')
        return batch
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          'Upload failed. Please try again.',
        )
        setError(message)
        toast.error(message)
        return null
      }
    },
    [uploadRows, toast],
  )

  return {
    previewFile,
    uploadRowsFromPreview,
    isPreviewing,
    isUploading,
    error,
  }
}
