import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Redo2, Clock3, CheckCheck, Coins } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { mockRedemptionRequests, redemptionKpis } from '@/features/wallets/mockRedemptions'
import { giftCategoryOptions } from '@/features/schemes/mockGifts'
import type { RedemptionRequest, RedemptionStatus, RedemptionUserType } from '@/types/redemption'

const statusConfig: Record<RedemptionStatus, { label: string; color: 'warning' | 'info' | 'error' | 'success' }> = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'info' },
  rejected: { label: 'Rejected', color: 'error' },
  completed: { label: 'Completed', color: 'success' },
}

interface RedemptionFilters extends Record<string, unknown> {
  status: RedemptionStatus | 'all'
  userType: RedemptionUserType | 'all'
  rewardCategory: string | 'all'
  fromDate: string
  toDate: string
}

export function RedemptionListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Redo2 size={20} />,
    title: 'Redemption Requests',
    subtitle: 'Review, approve, and track fulfillment of reward redemption requests.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<RedemptionFilters>({
    status: 'all',
    userType: 'all',
    rewardCategory: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredRequests = useMemo(
    () =>
      mockRedemptionRequests.filter((request) => {
        const statusMatch = appliedFilters.status === 'all' || request.redemptionStatus === appliedFilters.status
        const userTypeMatch = appliedFilters.userType === 'all' || request.userType === appliedFilters.userType
        const categoryMatch = appliedFilters.rewardCategory === 'all' || request.rewardCategory === appliedFilters.rewardCategory
        return statusMatch && userTypeMatch && categoryMatch
      }),
    [appliedFilters],
  )

  const columns: CommonTableColumn<RedemptionRequest>[] = [
    { key: 'id', header: 'Request ID', minWidth: 140, render: (row) => row.id },
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 170,
      sortable: true,
      sortValue: (row) => row.userName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/rewards-wallet/reward-redemptions/${row.id}`)}
        >
          {row.userName}
        </Typography>
      ),
    },
    { key: 'userType', header: 'User Type', minWidth: 100, render: (row) => row.userType },
    { key: 'rewardItem', header: 'Reward Item', minWidth: 180, render: (row) => row.rewardItem },
    { key: 'coinsUsed', header: 'Coins Used', align: 'right', sortable: true, sortValue: (row) => row.coinsUsed, render: (row) => row.coinsUsed.toLocaleString('en-IN') },
    { key: 'requestDate', header: 'Request Date', minWidth: 130, sortable: true, render: (row) => row.requestDate },
    {
      key: 'redemptionStatus',
      header: 'Redemption Status',
      minWidth: 140,
      render: (row) => <Chip size="small" label={statusConfig[row.redemptionStatus].label} color={statusConfig[row.redemptionStatus].color} />,
    },
    { key: 'approvedBy', header: 'Approved By', minWidth: 130, render: (row) => row.approvedBy ?? '—' },
    { key: 'deliveryStatus', header: 'Delivery Status', minWidth: 130, render: (row) => row.deliveryStatus.charAt(0).toUpperCase() + row.deliveryStatus.slice(1) },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Redemption Requests" value={redemptionKpis.totalRequests} icon={<Redo2 size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Pending Approvals" value={redemptionKpis.pendingApprovals} icon={<Clock3 size={20} />} iconColor="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Completed Redemptions" value={redemptionKpis.completedRedemptions} icon={<CheckCheck size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Coins Redeemed" value={redemptionKpis.coinsRedeemed.toLocaleString('en-IN')} icon={<Coins size={20} />} iconColor="secondary" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="redemption-requests-list"
        columns={columns}
        rows={filteredRequests}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by user name or request ID…"
        searchKeys={(row) => `${row.userName} ${row.id} ${row.rewardItem}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.userType !== 'all' ? 1 : 0) +
          (appliedFilters.rewardCategory !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="requestDate"
        defaultSortDir="desc"
        actions={[
          { label: 'View', onClick: (row) => navigate(`/rewards-wallet/reward-redemptions/${row.id}`) },
          { label: 'Edit', onClick: (row) => navigate(`/rewards-wallet/reward-redemptions/${row.id}`) },
        ]}
        emptyTitle="No redemption requests found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<RedemptionFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Redemption Requests"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as RedemptionFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <TextField
              select
              label="User Type"
              size="small"
              value={draft.userType}
              onChange={(e) => setDraft((prev) => ({ ...prev, userType: e.target.value as RedemptionFilters['userType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
            <TextField
              select
              label="Reward Category"
              size="small"
              value={draft.rewardCategory}
              onChange={(e) => setDraft((prev) => ({ ...prev, rewardCategory: e.target.value }))}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {giftCategoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Request Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Request Date To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, toDate: e.target.value }))}
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
