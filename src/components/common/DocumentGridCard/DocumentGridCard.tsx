import { useState } from 'react'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { FileText, FileBadge, FileCheck2, RefreshCw } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { SuccessDialog } from '@/components/common/SuccessDialog/SuccessDialog'
import { radius } from '@/theme/tokens'

export interface DocumentGridItem {
  id: string
  documentName: string
  uploadDate: string
  verificationStatus?: 'verified' | 'pending' | 'rejected'
  expiryDate?: string
  /** Direct URL to the uploaded file. When present, Download/preview link to this instead of a generated text summary. */
  fileUrl?: string
}

const statusChipColor: Record<
  NonNullable<DocumentGridItem['verificationStatus']>,
  'success' | 'warning' | 'error'
> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'error',
}

function documentIcon(documentName: string) {
  const name = documentName.toLowerCase()
  if (name.includes('certificate')) return FileBadge
  if (name.includes('license')) return FileCheck2
  return FileText
}

function downloadDocument(doc: DocumentGridItem) {
  if (doc.fileUrl) {
    const link = document.createElement('a')
    link.href = doc.fileUrl
    link.download = doc.documentName
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
    return
  }

  const content = [
    doc.documentName,
    doc.verificationStatus ? `Status: ${doc.verificationStatus}` : null,
    `Uploaded: ${doc.uploadDate}`,
    doc.expiryDate ? `Expires: ${doc.expiryDate}` : null,
  ]
    .filter(Boolean)
    .join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${doc.documentName.replace(/\s+/g, '-')}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export function DocumentGridCard<T extends DocumentGridItem>({
  title = 'Documents',
  documents,
  emptyTitle = 'No documents uploaded',
  emptyDescription = 'Documents added here will appear in this section.',
  showMetadata = true,
  onUpdateDocument,
}: {
  title?: string
  documents: T[]
  emptyTitle?: string
  emptyDescription?: string
  showMetadata?: boolean
  /** When provided, a "Update Document" action is shown in the preview so the file behind this document can be replaced. */
  onUpdateDocument?: (doc: T, file: File) => void | Promise<void>
}) {
  const [previewDoc, setPreviewDoc] = useState<T | null>(null)
  const [updateFile, setUpdateFile] = useState<File | null>(null)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [updateSuccessOpen, setUpdateSuccessOpen] = useState(false)
  const [savingUpdate, setSavingUpdate] = useState(false)

  return (
    <SectionCard title={title}>
      {documents.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <Grid container spacing={2}>
          {documents.map((doc) => {
            const Icon = documentIcon(doc.documentName)
            return (
              <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  onClick={() => setPreviewDoc(doc)}
                  sx={{
                    p: 2,
                    alignItems: 'center',
                    borderRadius: `${radius.lg}px`,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'border-color 150ms, background-color 150ms',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: `${radius.md}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {doc.documentName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      Uploaded {doc.uploadDate}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            )
          })}
        </Grid>
      )}

      {previewDoc && (
        <Modal
          open={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.documentName}
          maxWidth="sm"
          secondaryActionLabel="Close"
          primaryActionLabel="Download"
          onPrimaryAction={() => downloadDocument(previewDoc)}
        >
          <Stack spacing={2.5}>
            {onUpdateDocument && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshCw size={16} />}
                sx={{ alignSelf: 'flex-start' }}
                onClick={() => {
                  setUpdateFile(null)
                  setUpdateOpen(true)
                }}
              >
                Update Document
              </Button>
            )}
            {previewDoc.fileUrl && /\.(png|jpe?g|gif|webp)$/i.test(previewDoc.fileUrl) ? (
              <Box
                component="img"
                src={previewDoc.fileUrl}
                alt={previewDoc.documentName}
                sx={{
                  width: '100%',
                  maxHeight: 320,
                  objectFit: 'contain',
                  borderRadius: `${radius.lg}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.default',
                }}
              />
            ) : (
              <Box
                sx={{
                  borderRadius: `${radius.lg}px`,
                  border: '1px dashed',
                  borderColor: 'divider',
                  backgroundColor: 'background.default',
                  py: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                {(() => {
                  const Icon = documentIcon(previewDoc.documentName)
                  return (
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: `${radius.md}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                      }}
                    >
                      <Icon size={28} />
                    </Box>
                  )
                })()}
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {previewDoc.documentName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Preview not available for this file type — use Download to
                  save a copy.
                </Typography>
              </Box>
            )}

            {showMetadata && (
              <Stack
                direction="row"
                spacing={3}
                sx={{ flexWrap: 'wrap', rowGap: 1.5 }}
              >
                {previewDoc.verificationStatus && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      Status
                    </Typography>
                    <Chip
                      label={previewDoc.verificationStatus}
                      color={statusChipColor[previewDoc.verificationStatus]}
                      size="small"
                      variant="filled"
                      sx={{ textTransform: 'capitalize', mt: 0.5 }}
                    />
                  </Box>
                )}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block' }}
                  >
                    Uploaded
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {previewDoc.uploadDate}
                  </Typography>
                </Box>
                {previewDoc.expiryDate && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      Expires
                    </Typography>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {previewDoc.expiryDate}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </Modal>
      )}

      {previewDoc && (
        <Modal
          open={updateOpen}
          onClose={() => setUpdateOpen(false)}
          title="Update Document"
          description={`Upload a replacement file for "${previewDoc.documentName}".`}
          maxWidth="sm"
          secondaryActionLabel="Cancel"
          primaryActionLabel="Save"
          loading={savingUpdate}
          onPrimaryAction={async () => {
            if (!updateFile) return
            setSavingUpdate(true)
            await onUpdateDocument?.(previewDoc, updateFile)
            setSavingUpdate(false)
            setUpdateOpen(false)
            setPreviewDoc(null)
            setUpdateSuccessOpen(true)
          }}
        >
          <FileDropzone
            file={updateFile}
            onSelect={setUpdateFile}
            onRemove={() => setUpdateFile(null)}
            accept=".pdf,.jpg,.jpeg,.png"
            helperText="PDF, JPG or PNG"
          />
        </Modal>
      )}

      <SuccessDialog
        open={updateSuccessOpen}
        onClose={() => setUpdateSuccessOpen(false)}
        title="Document Updated"
        description="The replacement file has been uploaded and is awaiting re-verification."
        variant="success"
      />
    </SectionCard>
  )
}
