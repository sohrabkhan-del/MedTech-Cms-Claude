import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Checkbox, FormControlLabel, Grid, Stack, TextField, Typography } from '@mui/material'
import {
  FileBarChart as FileBarChartIcon,
  Users as UsersIcon,
  UserCheck as UserCheckIcon,
  ScanLine as ScanLineIcon,
  Coins as CoinsIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { mockChemistReports, chemistReportKpis } from '@/features/reportsAnalytics/mockChemistReports'
import type { ChemistReportRow } from '@/types/chemistReport'
import type { PartnerStatus, PartnerZone } from '@/types/partner'

interface ChemistReportFilters extends Record<string, unknown> {
  zones: PartnerZone[]
  statuses: PartnerStatus[]
  city: string
  dateFrom: string
  dateTo: string
}

const ALL_ZONES: PartnerZone[] = ['North', 'South', 'East', 'West']
const ALL_STATUSES: PartnerStatus[] = ['active', 'pending', 'inactive']

export function ChemistReportListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <FileBarChartIcon size={20} />,
    title: 'Chemist Reports',
    subtitle: 'Displays chemist onboarding, scan activity, and reward performance.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ChemistReportFilters>({
    zones: [],
    statuses: [],
    city: '',
    dateFrom: '',
    dateTo: '',
  })

  const filteredReports = mockChemistReports.filter((report) => {
    const zoneMatch = appliedFilters.zones.length === 0 || appliedFilters.zones.includes(report.zone)
    const statusMatch = appliedFilters.statuses.length === 0 || appliedFilters.statuses.includes(report.status)
    const cityMatch = !appliedFilters.city || report.city.toLowerCase().includes(appliedFilters.city.toLowerCase())
    return zoneMatch && statusMatch && cityMatch
  })

  const filterCount =
    appliedFilters.zones.length +
    appliedFilters.statuses.length +
    (appliedFilters.city ? 1 : 0) +
    (appliedFilters.dateFrom || appliedFilters.dateTo ? 1 : 0)

  const columns: CommonTableColumn<ChemistReportRow>[] = [
    {
      key: 'chemistName',
      header: 'Chemist Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.chemistName,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
            {row.chemistName.slice(0, 1)}
          </Avatar>
          <Typography
            sx={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate(`/reports/chemist-reports/${row.id}`)}
          >
            {row.chemistName}
          </Typography>
        </Stack>
      ),
    },
    { key: 'city', header: 'City', sortable: true, render: (row) => row.city },
    { key: 'zone', header: 'Zone', sortable: true, render: (row) => row.zone },
    {
      key: 'totalScans',
      header: 'Total Scans',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.totalScans,
      render: (row) => row.totalScans.toLocaleString('en-IN'),
    },
    {
      key: 'walletPoints',
      header: 'Wallet Points',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.walletPoints,
      render: (row) => row.walletPoints.toLocaleString('en-IN'),
    },
    {
      key: 'redemptions',
      header: 'Redemptions',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.redemptions,
      render: (row) => row.redemptions,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Chemists" value={chemistReportKpis.totalChemists} icon={<UsersIcon size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Active Chemists" value={chemistReportKpis.activeChemists} icon={<UserCheckIcon size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Scans"
            value={chemistReportKpis.totalScans.toLocaleString('en-IN')}
            icon={<ScanLineIcon size={20} />}
            iconColor="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Reward Points"
            value={chemistReportKpis.totalRewardPoints.toLocaleString('en-IN')}
            icon={<CoinsIcon size={20} />}
            iconColor="warning"
          />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="chemist-reports-list"
        columns={columns}
        rows={filteredReports}
        getRowId={(row) => row.id}
        searchPlaceholder="Search chemist reports…"
        searchKeys={(row) => `${row.chemistName} ${row.city} ${row.zone}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={filterCount}
        onExportClick={() => {}}
        defaultSortBy="chemistName"
        actions={[
          { label: 'View Report', onClick: (row) => navigate(`/reports/chemist-reports/${row.id}`) },
        ]}
        emptyTitle="No chemist reports found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<ChemistReportFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Chemist Reports"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Zone</Typography>
              {ALL_ZONES.map((zone) => (
                <FormControlLabel
                  key={zone}
                  control={
                    <Checkbox
                      checked={draft.zones.includes(zone)}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          zones: e.target.checked ? [...prev.zones, zone] : prev.zones.filter((z) => z !== zone),
                        }))
                      }
                    />
                  }
                  label={zone}
                />
              ))}
            </Stack>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Status</Typography>
              {ALL_STATUSES.map((status) => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      checked={draft.statuses.includes(status)}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          statuses: e.target.checked ? [...prev.statuses, status] : prev.statuses.filter((s) => s !== status),
                        }))
                      }
                    />
                  }
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                />
              ))}
            </Stack>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>City</Typography>
              <TextField
                size="small"
                placeholder="Filter by city…"
                value={draft.city}
                onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))}
              />
            </Stack>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Date Range</Typography>
              <TextField
                label="From"
                type="date"
                size="small"
                value={draft.dateFrom}
                onChange={(e) => setDraft((prev) => ({ ...prev, dateFrom: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="To"
                type="date"
                size="small"
                value={draft.dateTo}
                onChange={(e) => setDraft((prev) => ({ ...prev, dateTo: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
