import { useState } from 'react'
import { Box, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type { PartnerDocumentPayload } from '@/features/userManagement/chemistFormSchema'
import {
  uploadPartnerFile,
  deletePartnerFile,
} from '@/features/userManagement/services/fileUploadService'

const documentSlots = ['PAN Card', 'Drug License', 'GST Certificate'] as const

interface PartnerDocumentUploadsProps {
  folder: string
  profileImage?: PartnerDocumentPayload
  documents: PartnerDocumentPayload[]
  onProfileImageChange: (document: PartnerDocumentPayload | undefined) => void
  onDocumentsChange: (documents: PartnerDocumentPayload[]) => void
  showProfileImage?: boolean
  showDocuments?: boolean
}

function existingPreview(document?: PartnerDocumentPayload) {
  if (!document) return null
  // Prefer signed/view URL if available for a short-lived preview.
  return {
    name: document.name,
    url:
      document.viewUrl ||
      document.signedViewUrl ||
      document.directViewUrl ||
      document.objectUrl ||
      document.url ||
      document.path,
  }
}

export function PartnerDocumentUploads({
  folder,
  profileImage,
  documents,
  onProfileImageChange,
  onDocumentsChange,
  showProfileImage = true,
  showDocuments = true,
}: PartnerDocumentUploadsProps) {
  const toast = useToast()
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  async function uploadSlot(label: string, file: File) {
    setUploadingKey(label)
    try {
      const uploaded = await uploadPartnerFile(file, folder)
      const document = { ...uploaded, name: label }

      if (label === 'Profile Image') {
        onProfileImageChange(document)
      } else {
        onDocumentsChange([
          ...documents.filter((item) => item.name !== label),
          document,
        ])
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Failed to upload ${label}.`))
    } finally {
      setUploadingKey(null)
    }
  }

  function getDocument(label: string) {
    return documents.find((document) => document.name === label)
  }

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2.5}>
        {showProfileImage && (
          <Grid size={{ xs: 12, md: 12 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1 }}>
              Profile Image
            </Typography>
            <FileDropzone
              file={null}
              accept="image/png,image/jpeg,image/webp"
              helperText="Upload JPG, PNG, or WEBP"
              existingPreview={existingPreview(profileImage)}
              onSelect={(file) => uploadSlot('Profile Image', file)}
              onRemove={async () => {
                if (profileImage?.path)
                  await deletePartnerFile(profileImage.path)
                onProfileImageChange(undefined)
              }}
            />
            {uploadingKey === 'Profile Image' && (
              <LinearProgress sx={{ mt: 1 }} />
            )}
          </Grid>
        )}

        {showDocuments &&
          documentSlots.map((label) => {
            const document = getDocument(label)
            return (
              <Grid key={label} size={{ xs: 12, md: 12 }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: '0.75rem', mb: 1 }}
                >
                  {label}
                </Typography>
                <FileDropzone
                  file={null}
                  accept="image/png,image/jpeg,application/pdf"
                  helperText="Upload JPG, PNG, or PDF"
                  existingPreview={existingPreview(document)}
                  onSelect={(file) => uploadSlot(label, file)}
                  onRemove={async () => {
                    const doc = getDocument(label)
                    if (doc?.path) await deletePartnerFile(doc.path)
                    onDocumentsChange(
                      documents.filter((item) => item.name !== label),
                    )
                  }}
                />
                {uploadingKey === label && <LinearProgress sx={{ mt: 1 }} />}
              </Grid>
            )
          })}
      </Grid>

      {uploadingKey && (
        <Box sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          Uploading {uploadingKey}...
        </Box>
      )}
    </Stack>
  )
}
