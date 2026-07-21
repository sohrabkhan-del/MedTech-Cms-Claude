import { useState } from 'react'

interface UseFileUploadOptions<T> {
  upload: (manifestFile: File, supportingFile: File) => Promise<T>
}

/** Shared upload-flow state for file-driven flows (factory inventory upload, delivery upload, etc). */
export function useFileUpload<T>({ upload }: UseFileUploadOptions<T>) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<T | null>(null)

  async function uploadFiles(manifestFile: File, supportingFile: File) {
    setIsUploading(true)
    setError(null)

    try {
      const uploaded = await upload(manifestFile, supportingFile)
      setResult(uploaded)
      return uploaded
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFiles, isUploading, error, result }
}
