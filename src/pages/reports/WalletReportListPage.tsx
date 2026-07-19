import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { FileBarChart2, Wallet as WalletIcon, TrendingUp, TrendingDown, Coins } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { mockWalletReports, walletReportKpis } from '@/features/reports/mockWalletReports'
import type { WalletReportRow } from '@/types/walletReport'
import type { PartnerZone } from '@/types/partner'
import type { WalletStatus, WalletUserType } from '@/types/wallet'

const statusConfig: Record<WalletStatus, { label: string; color: 'success' | 'default' | 'error' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  suspended: { label: 'Suspended', color: 'error' },
}

interface WalletReportFilters extends Record<string, unknown> {
  userType: WalletUserType | 'all'
  status: WalletStatus | 'all'
  minBalance: string
  maxBalance: string
}

export function WalletReportListPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()
  useRegionTopbarHeader({
    icon: <FileBarChart2 size={20} />,
    title: 'Wallet Reports',
    subtitle: 'Displays wallet balances and transaction history.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<WalletReportFilters>({
    userType: 'all',
    status: 'all',
    minBalance: '',
    maxBalance: '',
  })

  const regionZone = region === 'All India' ? null : (region as PartnerZone)

  const filteredRows = useMemo(
    () =>
      mockWalletReports.filter((row) => {
        const regionMatch = !regionZone || row.region === regionZone
        const userTypeMatch = appliedFilters.userType === 'all' || row.userType === appliedFilters.userType
        const statusMatch = appliedFilters.status === 'all' || row.status === appliedFilters.status
        const minMatch = !appliedFilters.minBalance || row.walletBalance >= Number(appliedFilters.minBalance)
        const maxMatch = !appliedFilters.maxBalance || row.walletBalance <= Number(appliedFilters.maxBalance)
        return regionMatch && userTypeMatch && statusMatch && minMatch && maxMatch
      }),
    [appliedFilters, regionZone],
  )

  const columns: CommonTableColumn<WalletReportRow>[] = [
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 180,
      sortable: true,
      sortValue: (row) => row.userName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/reports/wallet-reports/${row.id}`)}
        >
          {row.userName}
        </Typography>
      ),
    },
    { key: 'userType', header: 'User Type', minWidth: 100, sortable: true, render: (row) => row.userType },
    {
      key: 'walletBalance',
      header: 'Wallet Balance',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.walletBalance,
      render: (row) => row.walletBalance.toLocaleString('en-IN'),
    },
    {
      key: 'credits',
      header: 'Credits',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.credits,
      render: (row) => row.credits.toLocaleString('en-IN'),
    },
    {
      key: 'debits',
      header: 'Debits',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.debits,
      render: (row) => row.debits.toLocaleString('en-IN'),
    },
    { key: 'lastTransaction', header: 'Last Transaction', minWidth: 150, sortable: true, render: (row) => row.lastTransaction },
    {
      key: 'status',
      header: 'Status',
      minWidth: 100,
      render: (row) => <Chip size="small" label={statusConfig[row.status].label} color={statusConfig[row.status].color} />,
    },
  ]

  const filterCount =
    (appliedFilters.userType !== 'all' ? 1 : 0) +
    (appliedFilters.status !== 'all' ? 1 : 0) +
    (appliedFilters.minBalance || appliedFilters.maxBalance ? 1 : 0)

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Wallets" value={walletReportKpis.totalWallets.toLocaleString('en-IN')} icon={<WalletIcon size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Balance Outstanding" value={walletReportKpis.totalBalanceOutstanding.toLocaleString('en-IN')} icon={<Coins size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Credits" value={walletReportKpis.totalCredits.toLocaleString('en-IN')} icon={<TrendingUp size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Debits" value={walletReportKpis.totalDebits.toLocaleString('en-IN')} icon={<TrendingDown size={20} />} iconColor="warning" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="wallet-reports-list"
        columns={columns}
        rows={filteredRows}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by user name or mobile number…"
        searchKeys={(row) => `${row.userName} ${row.mobileNumber} ${row.userId}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={filterCount}
        onExportClick={() => {}}
        defaultSortBy="userName"
        actions={[{ label: 'View', onClick: (row) => navigate(`/reports/wallet-reports/${row.id}`) }]}
        emptyTitle="No wallet reports found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<WalletReportFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Wallet Reports"
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
              onChange={(e) => setDraft((prev) => ({ ...prev, userType: e.target.value as WalletReportFilters['userType'] }))}
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
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as WalletReportFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
            <TextField
              type="number"
              label="Min Wallet Balance"
              size="small"
              value={draft.minBalance}
              onChange={(e) => setDraft((prev) => ({ ...prev, minBalance: e.target.value }))}
            />
            <TextField
              type="number"
              label="Max Wallet Balance"
              size="small"
              value={draft.maxBalance}
              onChange={(e) => setDraft((prev) => ({ ...prev, maxBalance: e.target.value }))}
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
