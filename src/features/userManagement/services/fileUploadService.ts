import axios from 'axios'
import { apiClient } from '@/services/apiClient'
import type { PartnerDocumentPayload } from '@/features/userManagement/chemistFormSchema'

interface SignedUrlResponse {
  success: boolean
  data: {
    uploadUrl: string
    filePath: string
    signedViewUrl?: string
    directViewUrl?: string
    url?: string
    file: {
      name: string
      type: string
      path: string
      viewUrl?: string
      signedViewUrl?: string
      directViewUrl?: string
      objectUrl?: string
      url?: string
    }
  }
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  path: string
  type: string
  viewUrl?: string
  signedViewUrl?: string
  directViewUrl?: string
  objectUrl?: string
  url?: string
}

/** Uploads a file to S3 via a backend-issued presigned URL, under the given
 *  folder (e.g. 'products', 'partners/dealer-docs'). */
export async function uploadFileToS3(
  file: File,
  folder: string,
): Promise<UploadedFile> {
  return uploadPartnerFile(file, folder)
}

export async function uploadPartnerFile(
  file: File,
  folder: string,
): Promise<PartnerDocumentPayload> {
  const signedUrlResponse = await apiClient.post<SignedUrlResponse>(
    '/file-upload/signed-url',
    {
      folder,
      filename: file.name,
      fileType: file.type,
    },
  )

  const {
    uploadUrl,
    filePath,
    signedViewUrl,
    directViewUrl,
    url,
    file: uploadedFile,
  } = signedUrlResponse.data.data

  const resolvedViewUrl =
    uploadedFile.viewUrl ||
    uploadedFile.signedViewUrl ||
    uploadedFile.directViewUrl ||
    uploadedFile.objectUrl ||
    uploadedFile.url ||
    signedViewUrl ||
    directViewUrl ||
    url

  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  })

  return {
    id: crypto.randomUUID(),
    name: uploadedFile.name || file.name,
    size: file.size,
    path: uploadedFile.path || filePath,
    type: uploadedFile.type || file.type,
    viewUrl: resolvedViewUrl,
    signedViewUrl:
      uploadedFile.signedViewUrl || signedViewUrl || resolvedViewUrl,
    directViewUrl:
      uploadedFile.directViewUrl || directViewUrl || resolvedViewUrl,
    objectUrl: uploadedFile.objectUrl || undefined,
    url: uploadedFile.url || url || resolvedViewUrl,
  }
}

export async function deleteUploadedFile(filePath: string): Promise<void> {
  return deletePartnerFile(filePath)
}

export async function deletePartnerFile(filePath: string): Promise<void> {
  try {
    await apiClient.delete('/file-upload', { data: { filePath } })
  } catch (err) {
    // swallow errors — deletion failure shouldn't crash the UI. Let callers
    // report a friendly message if needed.
  }
}
