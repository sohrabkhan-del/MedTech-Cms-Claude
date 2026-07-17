 import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Sparkle, CalendarClock, CheckCheck, Trophy } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import {
  mockSeasonalSchemes,
  seasonalSchemeKpis,
  schemeTypeOptions,
  schemeApplicableUserOptions,
  festivalOptions,
} from '@/features/schemes/mockSchemes'
import type { ApplicableUserType, Scheme, SchemeStatus, SchemeType } from '@/types/scheme'

const statusConfig: Record<SchemeStatus, { label: string; color: 'success' | 'default' | 'error' | 'info' | 'warning' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  expired: { label: 'Expired', color: 'error' },
  upcoming: { label: 'Upcoming', color: 'info' },
  draft: { label: 'Draft', color: 'warning' },
}

interface SeasonalSchemeFilters extends Record<string, unknown> {
  festival: string | 'all'
  status: SchemeStatus | 'all'
  schemeType: SchemeType | 'all'
  applicableTo: ApplicableUserType | 'all'
  fromDate: string
  toDate: string
}

export function SeasonalSchemesListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Sparkle size={20} />,
    title: 'Seasonal Schemes',
    subtitle: 'Limited-time promotional campaigns for festivals and special events.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<SeasonalSchemeFilters>({
    festival: 'all',
    status: 'all',
    schemeType: 'all',
    applicableTo: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredSchemes = useMemo(
    () =>
      mockSeasonalSchemes.filter((scheme) => {
        const festivalMatch = appliedFilters.festival === 'all' || scheme.festivalCampaign === appliedFilters.festival
        const statusMatch = appliedFilters.status === 'all' || scheme.status === appliedFilters.status
        const typeMatch = appliedFilters.schemeType === 'all' || scheme.schemeType === appliedFilters.schemeType
        const applicableMatch = appliedFilters.applicableTo === 'all' || scheme.applicableUsers.includes(appliedFilters.applicableTo)
        return festivalMatch && statusMatch && typeMatch && applicableMatch
      }),
    [appliedFilters],
  )

  const columns: CommonTableColumn<Scheme>[] = [
    { key: 'id', header: 'Scheme ID', minWidth: 140, render: (row) => row.id },
    {
      key: 'schemeName',
      header: 'Scheme Name',
      minWidth: 220,
      sortable: true,
      sortValue: (row) => row.schemeName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/scheme-management/schemes/sessional/${row.id}`)}
        >
          {row.schemeName}
        </Typography>
      ),
    },
    { key: 'festivalCampaign', header: 'Festival / Campaign', minWidth: 190, render: (row) => row.festivalCampaign ?? '—' },
    { key: 'schemeType', header: 'Scheme Type', minWidth: 150, render: (row) => row.schemeType },
    { key: 'applicableUsers', header: 'Applicable To', minWidth: 160, render: (row) => row.applicableUsers.join(', ') },
    { key: 'bonusValue', header: 'Bonus Value', align: 'right', sortable: true, sortValue: (row) => row.bonusValue, render: (row) => row.bonusValue },
    { key: 'startDate', header: 'Start Date', minWidth: 120, sortable: true, render: (row) => row.startDate },
    { key: 'endDate', header: 'End Date', minWidth: 120, render: (row) => row.endDate ?? '—' },
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
          <StatCard label="Active Seasonal Schemes" value={seasonalSchemeKpis.activeSchemes} icon={<Sparkle size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Upcoming Campaigns" value={seasonalSchemeKpis.upcomingCampaigns} icon={<CalendarClock size={20} />} iconColor="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Completed Campaigns" value={seasonalSchemeKpis.completedCampaigns} icon={<CheckCheck size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Reward Points Issued" value={seasonalSchemeKpis.rewardPointsIssued.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="seasonal-schemes-list"
        columns={columns}
        rows={filteredSchemes}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by scheme name or festival…"
        searchKeys={(row) => `${row.schemeName} ${row.id} ${row.festivalCampaign ?? ''}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.festival !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.schemeType !== 'all' ? 1 : 0) +
          (appliedFilters.applicableTo !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        createAction={{ label: 'Add Seasonal Scheme', to: '/scheme-management/schemes/sessional/new' }}
        defaultSortBy="startDate"
        defaultSortDir="desc"
        actions={[
          { label: 'View', onClick: (row) => navigate(`/scheme-management/schemes/sessional/${row.id}`) },
          { label: 'Edit', onClick: (row) => navigate(`/scheme-management/schemes/sessional/${row.id}/edit`) },
          { label: 'Delete', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No seasonal schemes found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<SeasonalSchemeFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Seasonal Schemes"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Festival / Campaign"
              size="small"
              value={draft.festival}
              onChange={(e) => setDraft((prev) => ({ ...prev, festival: e.target.value }))}
            >
              <MenuItem value="all">All Campaigns</MenuItem>
              {festivalOptions.map((festival) => (
                <MenuItem key={festival} value={festival}>
                  {festival}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Scheme Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as SeasonalSchemeFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </TextField>
            <TextField
              select
              label="Scheme Type"
              size="small"
              value={draft.schemeType}
              onChange={(e) => setDraft((prev) => ({ ...prev, schemeType: e.target.value as SeasonalSchemeFilters['schemeType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              {schemeTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Applicable To"
              size="small"
              value={draft.applicableTo}
              onChange={(e) => setDraft((prev) => ({ ...prev, applicableTo: e.target.value as SeasonalSchemeFilters['applicableTo'] }))}
            >
              <MenuItem value="all">All Users</MenuItem>
              {schemeApplicableUserOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Start Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Start Date To"
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
