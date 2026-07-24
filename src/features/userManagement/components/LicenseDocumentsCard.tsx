import { Chip, IconButton, Stack } from '@mui/material'
import { Download, Upload } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import type { LicenseDocument } from '@/types/partner'

const statusConfig: Record<
  LicenseDocument['verificationStatus'],
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  verified: { label: 'Verified', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
}

function buildColumns(
  onUpload: () => void,
): CommonTableColumn<LicenseDocument>[] {
  return [
    {
      key: 'documentName',
      header: 'Document Name',
      render: (row) => row.documentName,
    },
    {
      key: 'uploadDate',
      header: 'Upload Date',
      sortable: true,
      render: (row) => row.uploadDate,
    },
    {
      key: 'verificationStatus',
      header: 'Verification Status',
      sortable: true,
      sortValue: (row) => statusConfig[row.verificationStatus].label,
      render: (row) => (
        <Chip
          label={statusConfig[row.verificationStatus].label}
          color={statusConfig[row.verificationStatus].color}
          size="small"
        />
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      sortable: true,
      render: (row) => row.expiryDate,
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      hideable: false,
      render: () => (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ justifyContent: 'flex-end' }}
        >
          <IconButton size="small" aria-label="Download document">
            <Download size={20} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Upload document"
            onClick={onUpload}
          >
            <Upload size={20} />
          </IconButton>
        </Stack>
      ),
    },
  ]
}

export function LicenseDocumentsCard({
  documents,
  onUpload,
}: {
  documents: LicenseDocument[]
  onUpload?: () => void
}) {
  return (
    <SectionCard title="License & Documents">
      <CommonTable
        tableKey="partner-license-documents"
        columns={buildColumns(onUpload ?? (() => {}))}
        rows={documents}
        getRowId={(row) => row.id}
        searchPlaceholder="Search documents…"
        searchKeys={(row) => row.documentName}
        defaultSortBy="uploadDate"
        emptyTitle="No documents uploaded"
      />
    </SectionCard>
  )
}
