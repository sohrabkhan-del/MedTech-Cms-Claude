import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { scanAnalyticsRows } from '@/features/inventory/mockProductBatches'
import type { ScanAnalyticsRow } from '@/types/productBatch'

const columns: CommonTableColumn<ScanAnalyticsRow>[] = [
  { key: 'batchNumber', header: 'Batch Number', minWidth: 120, sortable: true, sortValue: (row) => row.batchNumber, render: (row) => row.batchNumber },
  { key: 'product', header: 'Product', minWidth: 180, sortable: true, sortValue: (row) => row.product, render: (row) => row.product },
  {
    key: 'successfulScans',
    header: 'Successful Scans',
    align: 'right',
    sortable: true,
    sortValue: (row) => row.successfulScans,
    render: (row) => row.successfulScans.toLocaleString('en-IN'),
  },
  { key: 'failedScans', header: 'Failed Scans', align: 'right', sortable: true, sortValue: (row) => row.failedScans, render: (row) => row.failedScans },
  { key: 'duplicateScans', header: 'Duplicate Scans', align: 'right', sortable: true, sortValue: (row) => row.duplicateScans, render: (row) => row.duplicateScans },
  { key: 'pendingScans', header: 'Pending Scans', align: 'right', sortable: true, sortValue: (row) => row.pendingScans, render: (row) => row.pendingScans.toLocaleString('en-IN') },
  {
    key: 'rewardPointsIssued',
    header: 'Reward Points Issued',
    align: 'right',
    sortable: true,
    sortValue: (row) => row.rewardPointsIssued,
    render: (row) => row.rewardPointsIssued.toLocaleString('en-IN'),
  },
]

export function ScanAnalyticsTab() {
  return (
    <CommonTable
      tableKey="scan-analytics"
      columns={columns}
      rows={scanAnalyticsRows}
      getRowId={(row) => row.batchNumber}
      searchPlaceholder="Search by batch number or product…"
      searchKeys={(row) => `${row.batchNumber} ${row.product}`}
      onExportClick={() => {}}
      defaultSortBy="batchNumber"
      emptyTitle="No scan analytics available"
    />
  )
}
