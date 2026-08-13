import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Chip, Typography } from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useGetPartnerScanHistoryQuery } from '@/features/userManagement/services/partnerActivityApi'
import type { PartnerScanHistoryRow } from '@/features/userManagement/services/partnerActivityApi'

const resultColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  SUCCESS: 'success',
  DUPLICATE: 'warning',
  FAILED: 'error',
}

const columns: CommonTableColumn<PartnerScanHistoryRow>[] = [
  {
    key: 'scannedAt',
    header: 'Scan Date',
    sortable: true,
    render: (row) => new Date(row.scannedAt).toLocaleString('en-IN'),
  },
  {
    key: 'scannedCode',
    header: 'Scan Code',
    render: (row) => row.scannedCode,
  },
  {
    key: 'productCode',
    header: 'Product Code',
    render: (row) => row.productCode,
  },
  {
    key: 'rewardPointsEarned',
    header: 'Reward Points',
    align: 'center',
    sortable: true,
    render: (row) => (
      <Typography
        component="span"
        sx={{ fontWeight: 700, fontSize: 'inherit', color: 'success.main' }}
      >
        +{row.rewardPointsEarned.toLocaleString('en-IN')}
      </Typography>
    ),
  },
  {
    key: 'scanResult',
    header: 'Scan Result',
    render: (row) => (
      <Chip
        label={row.scanResult}
        size="small"
        color={resultColor[row.scanStatus] ?? 'default'}
      />
    ),
  },
]

export function ScanHistoryCard({ partnerId }: { partnerId: string | undefined }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sortBy, setSortBy] = useState('scannedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { data, isFetching } = useGetPartnerScanHistoryQuery(
    partnerId
      ? {
          partnerId,
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch || undefined,
          sortBy,
          sortOrder,
        }
      : skipToken,
  )

  return (
    <SectionCard title="Scan History">
      <CommonTable
        tableKey="partner-scan-history"
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row.id}
        loading={isFetching}
        searchPlaceholder="Search scans…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onSortChange={(columnKey, dir) => {
          setSortBy(columnKey)
          setSortOrder(dir)
        }}
        defaultSortBy="scannedAt"
        defaultSortDir="desc"
        totalCount={data?.totalItems ?? 0}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        emptyTitle="No scans recorded"
      />
    </SectionCard>
  )
}
