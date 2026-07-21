import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Fence as FenceIcon, CircleCheck as CheckCircleOutlined, ClipboardClock as PendingActionsOutlined, Target as TrackChangesIcon, CalendarCheck as EventAvailableOutlined } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useGeoFences } from '@/features/fieldOperations/hooks/useGeoFences'
import type { GeoFence, GeoFenceUserType } from '@/features/fieldOperations/types/fieldOperations.types'
import type { PartnerZone } from '@/types/partner'

interface GeoFenceFilters extends Record<string, unknown> {
  userType: GeoFenceUserType | 'all'
  region: PartnerZone | 'all'
  status: GeoFence['status'] | 'all'
}

export function GeoFenceManagementPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()
  const { geoFences, kpis } = useGeoFences()
  useRegionTopbarHeader({
    icon: <FenceIcon size={20} />,
    title: 'Geo Fence Management',
    subtitle: 'Manage location-based scan validation for Dealers, Chemists, and MRs.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<GeoFenceFilters>({ userType: 'all', region: 'all', status: 'all' })

  const topbarZone = region === 'All India' ? null : (region as PartnerZone)

  const geoFenceKpis = kpis ?? { activeFences: 0, pendingVerification: 0, averageRadius: 0, verifiedThisWeek: 0 }

  const filteredFences = geoFences.filter((fence) => {
    const topbarRegionMatch = !topbarZone || fence.region === topbarZone
    const userTypeMatch = appliedFilters.userType === 'all' || fence.userType === appliedFilters.userType
    const regionMatch = appliedFilters.region === 'all' || fence.region === appliedFilters.region
    const statusMatch = appliedFilters.status === 'all' || fence.status === appliedFilters.status
    return topbarRegionMatch && userTypeMatch && regionMatch && statusMatch
  })

  const columns: CommonTableColumn<GeoFence>[] = [
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 160,
      sortable: true,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/field-operations/geo-fence-management/${row.id}`)}
        >
          {row.userName}
        </Typography>
      ),
    },
    { key: 'businessName', header: 'Business Name', minWidth: 170, sortable: true, render: (row) => row.businessName },
    {
      key: 'businessAddress',
      header: 'Business Address',
      minWidth: 220,
      render: (row) => (
        <Typography
          noWrap
          sx={{ fontSize: '0.8125rem', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}
          title={row.businessAddress}
        >
          {row.businessAddress}
        </Typography>
      ),
    },
    { key: 'userType', header: 'User Type', sortable: true, render: (row) => row.userType },
    { key: 'zone', header: 'Location', sortable: true, render: (row) => row.zone },
    { key: 'radiusMeters', header: 'Radius (mt)', align: 'right', sortable: true, sortValue: (row) => row.radiusMeters, render: (row) => row.radiusMeters },
    { key: 'lastVerified', header: 'Last Verified', minWidth: 140, render: (row) => row.lastVerified },
    { key: 'status', header: 'Status', sortable: true, sortValue: (row) => row.status, render: (row) => <StatusBadge status={row.status} /> },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Active Geo Fences" value={geoFenceKpis.activeFences} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Pending Verification" value={geoFenceKpis.pendingVerification} icon={<PendingActionsOutlined size={20} />} iconColor="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Average Radius" value={`${geoFenceKpis.averageRadius} m`} icon={<TrackChangesIcon size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Verified This Week" value={geoFenceKpis.verifiedThisWeek} icon={<EventAvailableOutlined size={20} />} iconColor="secondary" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="geo-fence-list"
        columns={columns}
        rows={filteredFences}
        getRowId={(row) => row.id}
        searchPlaceholder="Search geo fences…"
        searchKeys={(row) => `${row.userName} ${row.businessName} ${row.userType} ${row.zone}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.userType !== 'all' ? 1 : 0) + (appliedFilters.region !== 'all' ? 1 : 0) + (appliedFilters.status !== 'all' ? 1 : 0)
        }
        onExportClick={() => {}}
        createAction={{ label: 'Add Geo Fence', to: '/field-operations/geo-fence-management/new' }}
        defaultSortBy="userName"
        actions={[
          { label: 'View', onClick: (row) => navigate(`/field-operations/geo-fence-management/${row.id}`) },
          { label: 'Edit', onClick: (row) => navigate(`/field-operations/geo-fence-management/${row.id}/edit`) },
          { label: 'Activate', onClick: () => {} },
          { label: 'Deactivate', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No geo fences found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<GeoFenceFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Geo Fences"
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
              onChange={(e) => setDraft((prev) => ({ ...prev, userType: e.target.value as GeoFenceFilters['userType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
              <MenuItem value="MR">MR</MenuItem>
            </TextField>
            <TextField
              select
              label="Region"
              size="small"
              value={draft.region}
              onChange={(e) => setDraft((prev) => ({ ...prev, region: e.target.value as GeoFenceFilters['region'] }))}
            >
              <MenuItem value="all">All Regions</MenuItem>
              <MenuItem value="North">North</MenuItem>
              <MenuItem value="South">South</MenuItem>
              <MenuItem value="East">East</MenuItem>
              <MenuItem value="West">West</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as GeoFenceFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
