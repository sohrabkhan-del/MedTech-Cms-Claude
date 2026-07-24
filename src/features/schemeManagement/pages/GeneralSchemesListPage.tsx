import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Target, Users, Trophy, Ban } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useGeneralSchemes } from '@/features/schemeManagement/hooks/useGeneralSchemes'
import { useSchemeFormOptions } from '@/features/schemeManagement/hooks/useSchemeFormOptions'
import type { ApplicableUserType, Scheme, SchemeStatus, SchemeType } from '@/features/schemeManagement/types/schemeManagement.types'

const statusConfig: Record<SchemeStatus, { label: string; color: 'success' | 'default' | 'error' | 'info' | 'warning' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  expired: { label: 'Expired', color: 'error' },
  upcoming: { label: 'Upcoming', color: 'info' },
  draft: { label: 'Draft', color: 'warning' },
}

interface GeneralSchemeFilters extends Record<string, unknown> {
  status: SchemeStatus | 'all'
  schemeType: SchemeType | 'all'
  applicableTo: ApplicableUserType | 'all'
  fromDate: string
  toDate: string
}

export function GeneralSchemesListPage() {
  const navigate = useNavigate()
  const { schemes, kpis, isLoading } = useGeneralSchemes()
  const { schemeTypeOptions, schemeApplicableUserOptions } = useSchemeFormOptions()
  useRegionTopbarHeader({
    icon: <Target size={20} />,
    title: 'General Schemes',
    subtitle: 'Permanent, long-running reward schemes available throughout the year.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<GeneralSchemeFilters>({
    status: 'all',
    schemeType: 'all',
    applicableTo: 'all',
    fromDate: '',
    toDate: '',
  })

  const generalSchemeKpis = kpis ?? { activeSchemes: 0, totalParticipants: 0, rewardPointsIssued: 0, expiredSchemes: 0 }

  const filteredSchemes = schemes.filter((scheme) => {
    const statusMatch = appliedFilters.status === 'all' || scheme.status === appliedFilters.status
    const typeMatch = appliedFilters.schemeType === 'all' || scheme.schemeType === appliedFilters.schemeType
    const applicableMatch = appliedFilters.applicableTo === 'all' || scheme.applicableUsers.includes(appliedFilters.applicableTo)
    return statusMatch && typeMatch && applicableMatch
  })

  const columns: CommonTableColumn<Scheme>[] = [
    { key: 'id', header: 'Scheme ID', minWidth: 130, render: (row) => row.id },
    {
      key: 'schemeName',
      header: 'Scheme Name',
      minWidth: 220,
      sortable: true,
      sortValue: (row) => row.schemeName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/scheme-management/schemes/general/${row.id}`)}
        >
          {row.schemeName}
        </Typography>
      ),
    },
    { key: 'schemeType', header: 'Scheme Type', minWidth: 150, render: (row) => row.schemeType },
    { key: 'applicableUsers', header: 'Applicable To', minWidth: 160, render: (row) => row.applicableUsers.join(', ') },
    { key: 'bonusValue', header: 'Bonus Value', align: 'center', sortable: true, sortValue: (row) => row.bonusValue, render: (row) => row.bonusValue },
    { key: 'startDate', header: 'Start Date', minWidth: 120, sortable: true, render: (row) => row.startDate },
    { key: 'endDate', header: 'End Date', minWidth: 120, render: (row) => row.endDate ?? 'Ongoing' },
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
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Active General Schemes" value={generalSchemeKpis.activeSchemes} icon={<Target size={20} />} iconColor="primary" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Total Participants" value={generalSchemeKpis.totalParticipants.toLocaleString('en-IN')} icon={<Users size={20} />} iconColor="secondary" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Reward Points Issued" value={generalSchemeKpis.rewardPointsIssued.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Expired Schemes" value={generalSchemeKpis.expiredSchemes} icon={<Ban size={20} />} iconColor="error" />}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="general-schemes-list"
        columns={columns}
        rows={filteredSchemes}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search by scheme name or ID…"
        searchKeys={(row) => `${row.schemeName} ${row.id}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.schemeType !== 'all' ? 1 : 0) +
          (appliedFilters.applicableTo !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        createAction={{ label: 'Add General Scheme', to: '/scheme-management/schemes/general/new' }}
        defaultSortBy="startDate"
        defaultSortDir="desc"
        actions={[
          { label: 'View', onClick: (row) => navigate(`/scheme-management/schemes/general/${row.id}`) },
          { label: 'Edit', onClick: (row) => navigate(`/scheme-management/schemes/general/${row.id}/edit`) },
          { label: 'Delete', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No general schemes found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<GeneralSchemeFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter General Schemes"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Scheme Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as GeneralSchemeFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </TextField>
            <TextField
              select
              label="Scheme Type"
              size="small"
              value={draft.schemeType}
              onChange={(e) => setDraft((prev) => ({ ...prev, schemeType: e.target.value as GeneralSchemeFilters['schemeType'] }))}
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
              onChange={(e) => setDraft((prev) => ({ ...prev, applicableTo: e.target.value as GeneralSchemeFilters['applicableTo'] }))}
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
