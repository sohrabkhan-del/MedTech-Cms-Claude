import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Checkbox, FormControlLabel, Grid, Stack, Typography } from '@mui/material'
import {
  UserRound as UserRoundIcon,
  UserCheck as UserCheckIcon,
  Clock as ClockIcon,
  UserX as UserXIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useMedicalReps } from '@/features/systemUsers/hooks/useMedicalReps'
import type { MedicalRepresentative, PartnerStatus, PartnerZone } from '@/features/systemUsers/types/systemUsers.types'

interface MrFilters extends Record<string, unknown> {
  regions: PartnerZone[]
  statuses: PartnerStatus[]
}

const ALL_REGIONS: PartnerZone[] = ['North', 'South', 'East', 'West']
const ALL_STATUSES: PartnerStatus[] = ['active', 'pending', 'inactive']

export function MedicalRepListPage() {
  const navigate = useNavigate()
  const { medicalReps, kpis, isLoading } = useMedicalReps()
  useRegionTopbarHeader({
    icon: <UserRoundIcon size={20} />,
    title: 'Medical Representatives',
    subtitle: 'Manage field representatives, region access, and partner onboarding.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<MrFilters>({
    regions: [],
    statuses: [],
  })

  const mrKpis = kpis ?? { totalMrs: 0, activeMrs: 0, pendingMrs: 0, inactiveMrs: 0 }

  const filteredMrs = medicalReps.filter((mr) => {
    const regionMatch = appliedFilters.regions.length === 0 || appliedFilters.regions.includes(mr.region)
    const statusMatch = appliedFilters.statuses.length === 0 || appliedFilters.statuses.includes(mr.status)
    return regionMatch && statusMatch
  })

  const columns: CommonTableColumn<MedicalRepresentative>[] = [
    {
      key: 'name',
      header: 'MR Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
            {row.name.slice(0, 1)}
          </Avatar>
          <Typography
            sx={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate(`/system-users/medical-representatives/${row.id}`)}
          >
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    { key: 'email', header: 'Email Address', sortable: true, render: (row) => row.email },
    { key: 'phone', header: 'Phone Number', minWidth: 160, render: (row) => row.phone },
    { key: 'region', header: 'Region', sortable: true, render: (row) => row.region },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: 'lastLogin', header: 'Last Login', minWidth: 180, render: (row) => row.lastLogin },
    {
      key: 'totalDealersOnboarded',
      header: 'Total Dealers Onboarded',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.totalDealersOnboarded,
      render: (row) => row.totalDealersOnboarded,
    },
    {
      key: 'totalChemistsOnboarded',
      header: 'Total Chemists Onboarded',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.totalChemistsOnboarded,
      render: (row) => row.totalChemistsOnboarded,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Total MRs" value={mrKpis.totalMrs} icon={<UserRoundIcon size={20} />} iconColor="primary" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Active" value={mrKpis.activeMrs} icon={<UserCheckIcon size={20} />} iconColor="success" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Pending" value={mrKpis.pendingMrs} icon={<ClockIcon size={20} />} iconColor="warning" />}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? <StatCardSkeleton /> : <StatCard label="Inactive" value={mrKpis.inactiveMrs} icon={<UserXIcon size={20} />} iconColor="error" />}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="mrs-list"
        columns={columns}
        rows={filteredMrs}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search MRs…"
        searchKeys={(row) => `${row.name} ${row.email} ${row.phone}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={appliedFilters.regions.length + appliedFilters.statuses.length}
        onExportClick={() => {}}
        createAction={{ label: 'Create MR', to: '/system-users/medical-representatives/new' }}
        defaultSortBy="name"
        actions={[
          { label: 'View Details', onClick: (row) => navigate(`/system-users/medical-representatives/${row.id}`) },
          { label: 'Edit', onClick: (row) => navigate(`/system-users/medical-representatives/${row.id}/edit`) },
          { label: 'Activate MR', onClick: () => {} },
          { label: 'Deactivate MR', onClick: () => {}, danger: true },
          { label: 'Delete MR', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No medical representatives found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<MrFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter MRs"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Region</Typography>
              {ALL_REGIONS.map((region) => (
                <FormControlLabel
                  key={region}
                  control={
                    <Checkbox
                      checked={draft.regions.includes(region)}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          regions: e.target.checked
                            ? [...prev.regions, region]
                            : prev.regions.filter((r) => r !== region),
                        }))
                      }
                    />
                  }
                  label={region}
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
                          statuses: e.target.checked
                            ? [...prev.statuses, status]
                            : prev.statuses.filter((s) => s !== status),
                        }))
                      }
                    />
                  }
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
