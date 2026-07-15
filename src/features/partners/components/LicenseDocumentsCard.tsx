import { Card, Chip, IconButton, Stack, Typography } from '@mui/material'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined'
import { SimpleTable, type SimpleTableColumn } from '@/components/common/SimpleTable/SimpleTable'
import type { LicenseDocument } from '@/types/partner'

const statusConfig: Record<LicenseDocument['verificationStatus'], { label: string; color: 'success' | 'warning' | 'error' }> = {
  verified: { label: 'Verified', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
}

function buildColumns(onUpload: () => void): SimpleTableColumn<LicenseDocument>[] {
  return [
    { key: 'documentName', header: 'Document Name', render: (row) => row.documentName },
    { key: 'uploadDate', header: 'Upload Date', render: (row) => row.uploadDate },
    {
      key: 'verificationStatus',
      header: 'Verification Status',
      render: (row) => (
        <Chip label={statusConfig[row.verificationStatus].label} color={statusConfig[row.verificationStatus].color} size="small" />
      ),
    },
    { key: 'expiryDate', header: 'Expiry Date', render: (row) => row.expiryDate },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: () => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton size="small" aria-label="Download document">
            <DownloadOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Upload document" onClick={onUpload}>
            <UploadOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ]
}

export function LicenseDocumentsCard({ documents, onUpload }: { documents: LicenseDocument[]; onUpload?: () => void }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>License &amp; Documents</Typography>
      <SimpleTable
        columns={buildColumns(onUpload ?? (() => {}))}
        rows={documents}
        getRowId={(row) => row.id}
        emptyTitle="No documents uploaded"
      />
    </Card>
  )
}
