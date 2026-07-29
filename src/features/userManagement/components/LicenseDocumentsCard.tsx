import { useState } from 'react'
import { Box, Chip, Grid, Stack, Typography } from '@mui/material'
import { FileText, FileBadge, FileCheck2 } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { radius } from '@/theme/tokens'
import type { LicenseDocument } from '@/types/partner'

function documentIcon(documentName: string) {
  const name = documentName.toLowerCase()
  if (name.includes('certificate')) return FileBadge
  if (name.includes('license')) return FileCheck2
  return FileText
}

const statusChipColor: Record<
  LicenseDocument['verificationStatus'],
  'success' | 'warning' | 'error'
> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'error',
}

function downloadDocument(doc: LicenseDocument) {
  const content = [
    doc.documentName,
    `Status: ${doc.verificationStatus}`,
    `Uploaded: ${doc.uploadDate}`,
    `Expires: ${doc.expiryDate}`,
  ].join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${doc.documentName.replace(/\s+/g, '-')}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

export function LicenseDocumentsCard({
  documents,
}: {
  documents: LicenseDocument[]
}) {
  const [previewDoc, setPreviewDoc] = useState<LicenseDocument | null>(null)

  return (
    <SectionCard title="License & Documents">
      {documents.length === 0 ? (
        <EmptyState title="No documents uploaded" description="Documents added for this partner will appear here." />
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
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                Preview not available for this file type — use Download to save a copy.
              </Typography>
            </Box>

            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
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
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Uploaded
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  {previewDoc.uploadDate}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Expires
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  {previewDoc.expiryDate}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Modal>
      )}
    </SectionCard>
  )
}
