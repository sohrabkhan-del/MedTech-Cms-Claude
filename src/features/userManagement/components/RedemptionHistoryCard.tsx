import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Chip } from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useGetPartnerRedemptionsQuery } from '@/features/userManagement/services/partnerActivityApi'
import type { PartnerRedemptionRow } from '@/features/userManagement/services/partnerActivityApi'

const statusConfig: Record<string, { label: string; color: 'warning' | 'info' | 'error' | 'success' | 'default' }> = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  fulfilled: { label: 'Fulfilled', color: 'info' },
}

const columns: CommonTableColumn<PartnerRedemptionRow>[] = [
  { key: 'referenceId', header: 'Request ID', render: (row) => row.referenceId },
  { key: 'rewardItem', header: 'Reward Item', render: (row) => row.rewardItem },
  {
    key: 'pointsUsed',
    header: 'Points Used',
    align: 'center',
    sortable: true,
    render: (row) => row.pointsUsed.toLocaleString('en-IN'),
  },
  {
    key: 'requestDate',
    header: 'Request Date',
    sortable: true,
    render: (row) => new Date(row.requestDate).toLocaleString('en-IN'),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Chip
        size="small"
        label={statusConfig[row.status]?.label ?? row.status}
        color={statusConfig[row.status]?.color ?? 'default'}
      />
    ),
  },
]

export function RedemptionHistoryCard({ partnerId }: { partnerId: string | undefined }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sortBy, setSortBy] = useState('requestDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { data, isFetching } = useGetPartnerRedemptionsQuery(
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
    <SectionCard title="Redemption History">
      <CommonTable
        tableKey="partner-redemption-history"
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row.id}
        loading={isFetching}
        searchPlaceholder="Search redemptions…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onSortChange={(columnKey, dir) => {
          setSortBy(columnKey)
          setSortOrder(dir)
        }}
        defaultSortBy="requestDate"
        defaultSortDir="desc"
        totalCount={data?.totalItems ?? 0}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        emptyTitle="No redemptions yet"
        emptyDescription="This partner hasn't redeemed any rewards yet."
      />
    </SectionCard>
  )
}
