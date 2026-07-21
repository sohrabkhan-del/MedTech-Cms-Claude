import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { useScanAnalytics } from '@/features/inventoryManagement/hooks/useScanAnalytics'
import type { ScanAnalyticsRow } from '@/features/inventoryManagement/types/inventoryManagement.types'

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
  const { rows } = useScanAnalytics()

  return (
    <CommonTable
      tableKey="scan-analytics"
      columns={columns}
      rows={rows}
      getRowId={(row) => row.batchNumber}
      searchPlaceholder="Search by batch number or product…"
      searchKeys={(row) => `${row.batchNumber} ${row.product}`}
      onExportClick={() => {}}
      defaultSortBy="batchNumber"
      emptyTitle="No scan analytics available"
    />
  )
}
