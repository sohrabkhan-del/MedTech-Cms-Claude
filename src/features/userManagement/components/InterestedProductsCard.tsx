import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Chip } from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useGetPartnerInterestedProductsQuery } from '@/features/userManagement/services/partnerActivityApi'
import type { PartnerInterestedProductRow } from '@/features/userManagement/services/partnerActivityApi'

const statusConfig: Record<string, { label: string; color: 'info' | 'warning' | 'success' | 'default' }> = {
  new: { label: 'New', color: 'info' },
  followed_up: { label: 'Followed Up', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
}

const columns: CommonTableColumn<PartnerInterestedProductRow>[] = [
  { key: 'productName', header: 'Product Name', render: (row) => row.productName },
  {
    key: 'quantityRequested',
    header: 'Quantity Requested',
    align: 'center',
    render: (row) => row.quantityRequested.toLocaleString('en-IN'),
  },
  {
    key: 'requestedDate',
    header: 'Requested Date',
    sortable: true,
    render: (row) => new Date(row.requestedDate).toLocaleString('en-IN'),
  },
  { key: 'handledBy', header: 'Handled By', render: (row) => row.handledBy },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Chip
        label={statusConfig[row.status]?.label ?? row.status}
        color={statusConfig[row.status]?.color ?? 'default'}
        size="small"
      />
    ),
  },
]

export function InterestedProductsCard({ partnerId }: { partnerId: string | undefined }) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sortBy, setSortBy] = useState('requestedDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { data, isFetching } = useGetPartnerInterestedProductsQuery(
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
    <SectionCard title="Interested Products">
      <CommonTable
        tableKey="partner-interested-products"
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row.id}
        loading={isFetching}
        searchPlaceholder="Search products…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onSortChange={(columnKey, dir) => {
          setSortBy(columnKey)
          setSortOrder(dir)
        }}
        defaultSortBy="requestedDate"
        defaultSortDir="desc"
        totalCount={data?.totalItems ?? 0}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        emptyTitle="No product interest recorded"
      />
    </SectionCard>
  )
}
