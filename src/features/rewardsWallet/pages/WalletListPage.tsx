import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Wallet as WalletIcon, Coins, Repeat2, Clock3 } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useWallets } from '@/features/rewardsWallet/hooks/useWallets'
import type { PartnerZone } from '@/types/partner'
import type { Wallet, WalletStatus, WalletUserType } from '@/features/rewardsWallet/types/rewardsWallet.types'

const statusConfig: Record<WalletStatus, { label: string; color: 'success' | 'default' | 'error' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  suspended: { label: 'Suspended', color: 'error' },
}

interface WalletFilters extends Record<string, unknown> {
  userType: WalletUserType | 'all'
  status: WalletStatus | 'all'
  fromDate: string
  toDate: string
}

export function WalletListPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()
  useRegionTopbarHeader({
    icon: <WalletIcon size={20} />,
    title: 'Wallet Directory',
    subtitle: 'Manage wallet balances, reward points, and transaction history for Dealers and Chemists.',
  })
  const { wallets, kpis, isLoading } = useWallets()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<WalletFilters>({
    userType: 'all',
    status: 'all',
    fromDate: '',
    toDate: '',
  })

  const regionZone = region === 'All India' ? null : (region as PartnerZone)

  const filteredWallets = useMemo(
    () =>
      wallets.filter((wallet) => {
        const regionMatch = !regionZone || wallet.region === regionZone
        const userTypeMatch = appliedFilters.userType === 'all' || wallet.userType === appliedFilters.userType
        const statusMatch = appliedFilters.status === 'all' || wallet.status === appliedFilters.status
        return regionMatch && userTypeMatch && statusMatch
      }),
    [wallets, appliedFilters, regionZone],
  )

  const columns: CommonTableColumn<Wallet>[] = [
    { key: 'userId', header: 'User ID', minWidth: 100, render: (row) => row.userId },
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 180,
      sortable: true,
      sortValue: (row) => row.userName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/rewards-wallet/wallet-management/${row.id}`)}
        >
          {row.userName}
        </Typography>
      ),
    },
    { key: 'userType', header: 'User Type', minWidth: 100, render: (row) => row.userType },
    { key: 'mobileNumber', header: 'Mobile Number', minWidth: 140, render: (row) => row.mobileNumber },
    { key: 'region', header: 'Region', minWidth: 90, render: (row) => row.region },
    {
      key: 'availableBalance',
      header: 'Available Balance',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.availableBalance,
      render: (row) => row.availableBalance.toLocaleString('en-IN'),
    },
    {
      key: 'lifetimeEarned',
      header: 'Lifetime Earned',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.lifetimeEarned,
      render: (row) => row.lifetimeEarned.toLocaleString('en-IN'),
    },
    {
      key: 'lifetimeRedeemed',
      header: 'Lifetime Redeemed',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.lifetimeRedeemed,
      render: (row) => row.lifetimeRedeemed.toLocaleString('en-IN'),
    },
    {
      key: 'pendingRedemptionCoins',
      header: 'Pending Redemptions',
      align: 'right',
      render: (row) => row.pendingRedemptionCoins.toLocaleString('en-IN'),
    },
    { key: 'lastUpdated', header: 'Last Updated', minWidth: 160, render: (row) => row.lastUpdated },
    {
      key: 'status',
      header: 'Status',
      minWidth: 100,
      render: (row) => <Chip size="small" label={statusConfig[row.status].label} color={statusConfig[row.status].color} />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Total Wallet Balance" value={(kpis?.totalWalletBalance ?? 0).toLocaleString('en-IN')} icon={<WalletIcon size={20} />} iconColor="primary" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Total Coins Earned" value={(kpis?.totalCoinsEarned ?? 0).toLocaleString('en-IN')} icon={<Coins size={20} />} iconColor="success" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Total Coins Redeemed" value={(kpis?.totalCoinsRedeemed ?? 0).toLocaleString('en-IN')} icon={<Repeat2 size={20} />} iconColor="secondary" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Pending Redemptions" value={(kpis?.pendingRedemptions ?? 0).toLocaleString('en-IN')} icon={<Clock3 size={20} />} iconColor="warning" />}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="wallet-directory-list"
        columns={columns}
        rows={filteredWallets}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search by user name or mobile number…"
        searchKeys={(row) => `${row.userName} ${row.mobileNumber} ${row.userId}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={(appliedFilters.userType !== 'all' ? 1 : 0) + (appliedFilters.status !== 'all' ? 1 : 0) + (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)}
        onExportClick={() => {}}
        defaultSortBy="userName"
        actions={[{ label: 'View Wallet', onClick: (row) => navigate(`/rewards-wallet/wallet-management/${row.id}`) }]}
        emptyTitle="No wallets found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<WalletFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Wallets"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="User Type"
              size="small"
              value={draft.userType}
              onChange={(e) => setDraft((prev) => ({ ...prev, userType: e.target.value as WalletFilters['userType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
            <TextField
              select
              label="Wallet Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as WalletFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Registered From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Registered To"
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
