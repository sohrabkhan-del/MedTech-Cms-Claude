import { useState } from 'react'

interface UseFileUploadOptions<T> {
  upload: (file: File) => Promise<T>
}

/** Shared upload-flow state for file-driven flows (factory inventory upload, delivery upload, etc). */
export function useFileUpload<T>({ upload }: UseFileUploadOptions<T>) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<T | null>(null)

  async function uploadFile(file: File) {
    setIsUploading(true)
    setError(null)

    try {
      const uploaded = await upload(file)
      setResult(uploaded)
      return uploaded
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFile, isUploading, error, result }
}
