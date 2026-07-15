import { Card, Chip, Typography } from '@mui/material'
import { SimpleTable, type SimpleTableColumn } from '@/components/common/SimpleTable/SimpleTable'
import type { InterestedProductEntry } from '@/types/partner'

const statusConfig: Record<InterestedProductEntry['status'], { label: string; color: 'info' | 'warning' | 'success' }> = {
  new: { label: 'New', color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
}

const columns: SimpleTableColumn<InterestedProductEntry>[] = [
  { key: 'productName', header: 'Product Name', render: (row) => row.productName },
  { key: 'requestedDate', header: 'Requested Date', render: (row) => row.requestedDate },
  { key: 'handledBy', header: 'Handled By', render: (row) => row.handledBy },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Chip label={statusConfig[row.status].label} color={statusConfig[row.status].color} size="small" />,
  },
]

export function InterestedProductsCard({ entries }: { entries: InterestedProductEntry[] }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>Interested Products</Typography>
      <SimpleTable columns={columns} rows={entries} getRowId={(row) => row.id} emptyTitle="No product interest recorded" />
    </Card>
  )
}
