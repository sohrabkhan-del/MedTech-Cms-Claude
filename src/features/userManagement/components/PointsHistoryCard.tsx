import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Typography } from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useGetPartnerPointsHistoryQuery } from '@/features/userManagement/services/partnerActivityApi'
import type { PartnerPointsHistoryRow } from '@/features/userManagement/services/partnerActivityApi'
import {
  useGetPartnerWalletBalanceQuery,
  useCreditPartnerWalletMutation,
} from '@/features/rewardsWallet/services/walletPartnersApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { PointsManagementCard } from './PointsManagementCard'

const columns: CommonTableColumn<PartnerPointsHistoryRow>[] = [
  {
    key: 'createdAt',
    header: 'Date',
    sortable: true,
    render: (row) => new Date(row.createdAt).toLocaleString('en-IN'),
  },
  {
    key: 'type',
    header: 'Transaction Type',
    render: (row) => (row.type === 'credit' ? 'Credit' : 'Debit'),
  },
  {
    key: 'rewardPointsEarned',
    header: 'Points Earned',
    align: 'center',
    sortable: true,
    render: (row) => {
      const isFailed = row.scanStatus === 'FAILED'
      return (
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: 'inherit',
            color: isFailed ? 'error.main' : 'success.main',
          }}
        >
          {isFailed
            ? '0'
            : `+${row.rewardPointsEarned.toLocaleString('en-IN')}`}
        </Typography>
      )
    },
  },
  {
    key: 'points',
    header: 'Points Added / Deducted',
    align: 'center',
    sortable: true,
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
        {(row.points ?? 0).toLocaleString('en-IN')}
      </Typography>
    ),
  },
  {
    key: 'reason',
    header: 'Description',
    render: (row) => row.reason,
  },
  {
    key: 'balanceAfter',
    header: 'Current Balance',
    align: 'center',
    sortable: true,
    render: (row) => (row.balanceAfter ?? 0).toLocaleString('en-IN'),
  },
]

export function PointsHistoryCard({
  partnerId,
}: {
  partnerId: string | undefined
}) {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const { data: walletBalance } = useGetPartnerWalletBalanceQuery(
    partnerId ?? '',
    { skip: !partnerId },
  )
  const [creditWallet] = useCreditPartnerWalletMutation()

  const { data, isFetching } = useGetPartnerPointsHistoryQuery(
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

  const handleAdjustPoints = async (
    type: 'credit' | 'debit',
    points: number,
    reason: string,
  ) => {
    if (!partnerId) return
    try {
      await creditWallet({ partnerId, points, note: reason, type }).unwrap()
      toast.success(
        type === 'credit'
          ? 'Points added successfully.'
          : 'Points removed successfully.',
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to adjust points.'))
    }
  }

  return (
    <SectionCard title="Points History">
      <PointsManagementCard
        currentBalance={walletBalance?.totalPoints ?? 0}
        onAdjust={handleAdjustPoints}
      />
      <CommonTable
        tableKey="partner-Points-history"
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row.id}
        loading={isFetching}
        searchPlaceholder="Search transactions…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onSortChange={(columnKey, dir) => {
          setSortBy(columnKey)
          setSortOrder(dir)
        }}
        defaultSortBy="createdAt"
        defaultSortDir="desc"
        totalCount={data?.totalItems ?? 0}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        emptyTitle="No transactions yet"
      />
    </SectionCard>
  )
}
