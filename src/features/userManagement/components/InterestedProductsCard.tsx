import { Chip } from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import type { InterestedProductEntry } from '@/types/partner'

const statusConfig: Record<InterestedProductEntry['status'], { label: string; color: 'info' | 'warning' | 'success' }> = {
  new: { label: 'New', color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
}

const columns: CommonTableColumn<InterestedProductEntry>[] = [
  { key: 'productName', header: 'Product Name', render: (row) => row.productName },
  { key: 'requestedDate', header: 'Requested Date', sortable: true, render: (row) => row.requestedDate },
  { key: 'handledBy', header: 'Handled By', render: (row) => row.handledBy },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    sortValue: (row) => statusConfig[row.status].label,
    render: (row) => <Chip label={statusConfig[row.status].label} color={statusConfig[row.status].color} size="small" />,
  },
]

export function InterestedProductsCard({ entries }: { entries: InterestedProductEntry[] }) {
  return (
    <SectionCard title="Interested Products">
      <CommonTable
        tableKey="partner-interested-products"
        columns={columns}
        rows={entries}
        getRowId={(row) => row.id}
        searchPlaceholder="Search products…"
        searchKeys={(row) => `${row.productName} ${row.handledBy}`}
        defaultSortBy="requestedDate"
        emptyTitle="No product interest recorded"
      />
    </SectionCard>
  )
}
