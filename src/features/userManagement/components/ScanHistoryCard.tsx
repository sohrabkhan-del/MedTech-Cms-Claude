import { Chip } from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import type { ScanHistoryEntry } from '@/types/partner'

const resultColor: Record<
  ScanHistoryEntry['result'],
  'success' | 'warning' | 'error'
> = {
  valid: 'success',
  duplicate: 'warning',
  invalid: 'error',
}

const columns: CommonTableColumn<ScanHistoryEntry>[] = [
  {
    key: 'scanDate',
    header: 'Scan Date',
    sortable: true,
    render: (row) => row.scanDate,
  },
  {
    key: 'barcodeNumber',
    header: 'Barcode Number',
    render: (row) => row.barcodeNumber,
  },
  {
    key: 'productName',
    header: 'Product Name',
    render: (row) => row.productName,
  },
  {
    key: 'rewardPoints',
    header: 'Reward Points',
    align: 'center',
    sortable: true,
    sortValue: (row) => row.rewardPoints,
    render: (row) => row.rewardPoints.toLocaleString('en-IN'),
  },
  {
    key: 'result',
    header: 'Scan Result',
    sortable: true,
    sortValue: (row) => row.result,
    render: (row) => (
      <Chip
        label={row.result}
        size="small"
        color={resultColor[row.result]}
        sx={{ textTransform: 'capitalize' }}
      />
    ),
  },
]

export function ScanHistoryCard({ entries }: { entries: ScanHistoryEntry[] }) {
  return (
    <SectionCard title="Scan History">
      <CommonTable
        tableKey="partner-scan-history"
        columns={columns}
        rows={entries}
        getRowId={(row) => row.id}
        searchPlaceholder="Search scans…"
        searchKeys={(row) => `${row.barcodeNumber} ${row.productName}`}
        defaultSortBy="scanDate"
        emptyTitle="No scans recorded"
      />
    </SectionCard>
  )
}
