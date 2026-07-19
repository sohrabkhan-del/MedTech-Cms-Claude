import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Gift, Coins, Layers, Percent } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import {
  mockRewardReports,
  rewardReportKpis,
  rewardReportUserTypeOptions,
  rewardReportTypeOptions,
  rewardReportSchemeOptions,
} from '@/features/reports/mockRewardReports'
import type { RewardReportEntry, RewardReportStatus, RewardReportType, RewardReportUserType } from '@/types/rewardReport'

const statusConfig: Record<RewardReportStatus, { label: string; color: 'success' | 'warning' | 'info' | 'error' }> = {
  credited: { label: 'Credited', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  redeemed: { label: 'Redeemed', color: 'info' },
  reversed: { label: 'Reversed', color: 'error' },
}

interface RewardReportFilters extends Record<string, unknown> {
  userType: RewardReportUserType | 'all'
  rewardType: RewardReportType | 'all'
  scheme: string | 'all'
  status: RewardReportStatus | 'all'
  fromDate: string
  toDate: string
}

export function RewardReportListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Gift size={20} />,
    title: 'Reward Reports',
    subtitle: 'Reward earning and redemption analytics across Dealers, Chemists, and MRs.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<RewardReportFilters>({
    userType: 'all',
    rewardType: 'all',
    scheme: 'all',
    status: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredReports = useMemo(
    () =>
      mockRewardReports.filter((report) => {
        const userTypeMatch = appliedFilters.userType === 'all' || report.userType === appliedFilters.userType
        const rewardTypeMatch = appliedFilters.rewardType === 'all' || report.rewardType === appliedFilters.rewardType
        const schemeMatch = appliedFilters.scheme === 'all' || report.schemeName === appliedFilters.scheme
        const statusMatch = appliedFilters.status === 'all' || report.status === appliedFilters.status
        return userTypeMatch && rewardTypeMatch && schemeMatch && statusMatch
      }),
    [appliedFilters],
  )

  const columns: CommonTableColumn<RewardReportEntry>[] = [
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 170,
      sortable: true,
      sortValue: (row) => row.userName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/reports/reward-reports/${row.id}`)}
        >
          {row.userName}
        </Typography>
      ),
    },
    { key: 'userType', header: 'User Type', minWidth: 100, render: (row) => row.userType },
    { key: 'rewardType', header: 'Reward Type', minWidth: 150, render: (row) => row.rewardType },
    { key: 'rewardPoints', header: 'Reward Points', align: 'right', sortable: true, sortValue: (row) => row.rewardPoints, render: (row) => row.rewardPoints.toLocaleString('en-IN') },
    { key: 'schemeName', header: 'Scheme', minWidth: 190, render: (row) => row.schemeName },
    { key: 'date', header: 'Date', minWidth: 120, sortable: true, render: (row) => row.date },
    {
      key: 'status',
      header: 'Status',
      minWidth: 120,
      render: (row) => <Chip size="small" label={statusConfig[row.status].label} color={statusConfig[row.status].color} />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Rewards Issued" value={rewardReportKpis.totalRewardsIssued} icon={<Gift size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Points Distributed" value={rewardReportKpis.totalPointsDistributed.toLocaleString('en-IN')} icon={<Coins size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Active Schemes" value={rewardReportKpis.activeSchemesCount} icon={<Layers size={20} />} iconColor="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Redemption Rate" value={`${rewardReportKpis.redemptionRate}%`} icon={<Percent size={20} />} iconColor="success" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="reward-reports-list"
        columns={columns}
        rows={filteredReports}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by user name or scheme…"
        searchKeys={(row) => `${row.userName} ${row.schemeName} ${row.id}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.userType !== 'all' ? 1 : 0) +
          (appliedFilters.rewardType !== 'all' ? 1 : 0) +
          (appliedFilters.scheme !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="date"
        defaultSortDir="desc"
        actions={[{ label: 'View', onClick: (row) => navigate(`/reports/reward-reports/${row.id}`) }]}
        emptyTitle="No reward reports found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<RewardReportFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Reward Reports"
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
              onChange={(e) => setDraft((prev) => ({ ...prev, userType: e.target.value as RewardReportFilters['userType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              {rewardReportUserTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Reward Type"
              size="small"
              value={draft.rewardType}
              onChange={(e) => setDraft((prev) => ({ ...prev, rewardType: e.target.value as RewardReportFilters['rewardType'] }))}
            >
              <MenuItem value="all">All Reward Types</MenuItem>
              {rewardReportTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Scheme"
              size="small"
              value={draft.scheme}
              onChange={(e) => setDraft((prev) => ({ ...prev, scheme: e.target.value }))}
            >
              <MenuItem value="all">All Schemes</MenuItem>
              {rewardReportSchemeOptions.map((scheme) => (
                <MenuItem key={scheme} value={scheme}>
                  {scheme}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as RewardReportFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="credited">Credited</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="redeemed">Redeemed</MenuItem>
              <MenuItem value="reversed">Reversed</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Date To"
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
