import { useState } from 'react'
import { Box, Chip, Grid, Stack, Typography } from '@mui/material'
import { Warehouse, FileText, FileBadge, FileCheck2 } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { radius } from '@/theme/tokens'
import type { RequestBusiness, RequestDocument } from '@/types/approvalRequest'

function documentIcon(documentName: string) {
  const name = documentName.toLowerCase()
  if (name.includes('certificate')) return FileBadge
  if (name.includes('license')) return FileCheck2
  return FileText
}

function downloadDocument(doc: RequestDocument) {
  const content = [doc.documentName, `Status: ${doc.verificationStatus}`, `Uploaded: ${doc.uploadDate}`]
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

export function GodownDocumentsCard({
  title = 'Godowns & Documents',
  businesses,
  emptyTitle = 'No godowns added',
  emptyDescription = 'Godowns/outlets added for this request will appear here.',
}: {
  title?: string
  businesses: RequestBusiness[]
  emptyTitle?: string
  emptyDescription?: string
}) {
  const [previewDoc, setPreviewDoc] = useState<RequestDocument | null>(null)
  const totalDocuments = businesses.reduce(
    (sum, business) => sum + business.documents.length,
    0,
  )

  return (
    <SectionCard
      title={title}
      action={
        businesses.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Chip
              label={`${businesses.length} godown${businesses.length === 1 ? '' : 's'}`}
              size="small"
              color="primary"
              variant="filled"
              sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
            />
            <Chip
              label={`${totalDocuments} document${totalDocuments === 1 ? '' : 's'}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
            />
          </Stack>
        )
      }
    >
      {businesses.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <Stack spacing={2.5}>
          {businesses.map((business) => (
            <Box
              key={business.id}
              sx={{
                p: 2.5,
                borderRadius: `${radius.lg}px`,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap', rowGap: 1 }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: `${radius.md}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                    flexShrink: 0,
                  }}
                >
                  <Warehouse size={18} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    {business.outletName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {business.address}
                  </Typography>
                </Box>
                <Chip label={business.addressType} size="small" variant="outlined" />
                <Chip
                  label={`${business.documents.length} document${business.documents.length === 1 ? '' : 's'}`}
                  size="small"
                  color="primary"
                  variant="filled"
                />
              </Stack>

              <Stack
                direction="row"
                spacing={3}
                sx={{ mb: business.documents.length ? 2 : 0, flexWrap: 'wrap', rowGap: 1 }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Drug License No.
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {business.drugLicenseNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    PAN Number
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {business.panNumber}
                  </Typography>
                </Box>
              </Stack>

              {business.documents.length === 0 ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  No documents uploaded for this godown.
                </Typography>
              ) : (
                <Grid container spacing={1.5}>
                  {business.documents.map((doc) => {
                    const Icon = documentIcon(doc.documentName)
                    return (
                      <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          onClick={() => setPreviewDoc(doc)}
                          sx={{
                            p: 1.5,
                            alignItems: 'center',
                            borderRadius: `${radius.md}px`,
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'background.paper',
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
                              width: 32,
                              height: 32,
                              borderRadius: `${radius.sm}px`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'primary.light',
                              color: 'primary.main',
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={16} />
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              minWidth: 0,
                            }}
                          >
                            {doc.documentName}
                          </Typography>
                        </Stack>
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </Box>
          ))}
        </Stack>
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
        </Modal>
      )}
    </SectionCard>
  )
}
