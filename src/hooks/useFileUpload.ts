import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface UseFileUploadOptions<T> {
  upload: (manifestFile: File, supportingFile: File) => Promise<T>
}

/** Shared upload-flow state for file-driven flows (factory inventory upload, delivery upload, etc). */
export function useFileUpload<T>({ upload }: UseFileUploadOptions<T>) {
  const toast = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<T | null>(null)

  async function uploadFiles(manifestFile: File, supportingFile: File) {
    setIsUploading(true)
    setError(null)

    try {
      const uploaded = await upload(manifestFile, supportingFile)
      setResult(uploaded)
      toast.success('Files uploaded successfully.')
      return uploaded
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFiles, isUploading, error, result }
}
