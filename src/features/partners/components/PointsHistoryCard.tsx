import { Card, Typography } from '@mui/material'
import { SimpleTable, type SimpleTableColumn } from '@/components/common/SimpleTable/SimpleTable'
import type { PointsHistoryEntry } from '@/types/partner'

const columns: SimpleTableColumn<PointsHistoryEntry>[] = [
  { key: 'transactionId', header: 'Transaction ID', render: (row) => row.transactionId },
  { key: 'date', header: 'Date', render: (row) => row.date },
  {
    key: 'type',
    header: 'Transaction Type',
    render: (row) => (row.type === 'credit' ? 'Credit' : 'Debit'),
  },
  {
    key: 'points',
    header: 'Points Added / Deducted',
    align: 'right',
    render: (row) => (
      <Typography
        component="span"
        sx={{ fontWeight: 700, fontSize: 'inherit', color: row.type === 'credit' ? 'success.main' : 'error.main' }}
      >
        {row.type === 'credit' ? '+' : '-'}
        {row.points.toLocaleString('en-IN')}
      </Typography>
    ),
  },
  { key: 'description', header: 'Description', render: (row) => row.description },
  {
    key: 'balanceAfter',
    header: 'Current Balance',
    align: 'right',
    render: (row) => row.balanceAfter.toLocaleString('en-IN'),
  },
]

export function PointsHistoryCard({ entries }: { entries: PointsHistoryEntry[] }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>Points History</Typography>
      <SimpleTable columns={columns} rows={entries} getRowId={(row) => row.id} emptyTitle="No transactions yet" />
    </Card>
  )
}
