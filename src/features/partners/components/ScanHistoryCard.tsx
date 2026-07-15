import { Card, Chip, Typography } from '@mui/material'
import { SimpleTable, type SimpleTableColumn } from '@/components/common/SimpleTable/SimpleTable'
import type { ScanHistoryEntry } from '@/types/partner'

const resultColor: Record<ScanHistoryEntry['result'], 'success' | 'warning' | 'error'> = {
  valid: 'success',
  duplicate: 'warning',
  invalid: 'error',
}

const columns: SimpleTableColumn<ScanHistoryEntry>[] = [
  { key: 'scanDate', header: 'Scan Date', render: (row) => row.scanDate },
  { key: 'barcodeNumber', header: 'Barcode Number', render: (row) => row.barcodeNumber },
  { key: 'productName', header: 'Product Name', render: (row) => row.productName },
  { key: 'rewardPoints', header: 'Reward Points', render: (row) => row.rewardPoints.toLocaleString('en-IN'), align: 'right' },
  {
    key: 'result',
    header: 'Scan Result',
    render: (row) => (
      <Chip label={row.result} size="small" color={resultColor[row.result]} sx={{ textTransform: 'capitalize' }} />
    ),
  },
]

export function ScanHistoryCard({ entries }: { entries: ScanHistoryEntry[] }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>Scan History</Typography>
      <SimpleTable columns={columns} rows={entries} getRowId={(row) => row.id} emptyTitle="No scans recorded" />
    </Card>
  )
}
