import { Typography } from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import type { PointsHistoryEntry } from '@/types/partner'

const columns: CommonTableColumn<PointsHistoryEntry>[] = [
  {
    key: 'transactionId',
    header: 'Transaction ID',
    render: (row) => row.transactionId,
  },
  { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
  {
    key: 'type',
    header: 'Transaction Type',
    sortable: true,
    sortValue: (row) => row.type,
    render: (row) => (row.type === 'credit' ? 'Credit' : 'Debit'),
  },
  {
    key: 'points',
    header: 'Points Added / Deducted',
    align: 'center',
    sortable: true,
    sortValue: (row) => row.points,
    render: (row) => (
      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: 'inherit',
          color: row.type === 'credit' ? 'success.main' : 'error.main',
        }}
      >
        {row.type === 'credit' ? '+' : '-'}
        {row.points.toLocaleString('en-IN')}
      </Typography>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    render: (row) => row.description,
  },
  {
    key: 'balanceAfter',
    header: 'Current Balance',
    align: 'center',
    sortable: true,
    sortValue: (row) => row.balanceAfter,
    render: (row) => row.balanceAfter.toLocaleString('en-IN'),
  },
]

export function PointsHistoryCard({
  entries,
}: {
  entries: PointsHistoryEntry[]
}) {
  return (
    <SectionCard title="Points History">
      <CommonTable
        tableKey="partner-points-history"
        columns={columns}
        rows={entries}
        getRowId={(row) => row.id}
        searchPlaceholder="Search transactions…"
        searchKeys={(row) => `${row.transactionId} ${row.description}`}
        defaultSortBy="date"
        emptyTitle="No transactions yet"
      />
    </SectionCard>
  )
}
