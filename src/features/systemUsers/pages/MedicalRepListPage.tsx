import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  UserRound as UserRoundIcon,
  UserCheck as UserCheckIcon,
  Clock as ClockIcon,
  UserX as UserXIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useMedicalReps } from '@/features/systemUsers/hooks/useMedicalReps'
import { fallbackRegions, getRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import type { MedicalRepresentative } from '@/features/systemUsers/types/systemUsers.types'
import type { PartnerStatus } from '@/types/partner'

interface MrFilters extends Record<string, unknown> {
  status: PartnerStatus | 'all'
  regionId: string
}

// Maps CommonTable column keys to GET /medical-representatives `sortBy`
// field names.
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  name: 'fullName',
  status: 'status',
  createdAt: 'createdAt',
}

export function MedicalRepListPage() {
  const navigate = useNavigate()
  const [regions, setRegions] = useState<RegionOption[]>(fallbackRegions)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<MrFilters>({
    status: 'all',
    regionId: '',
  })
  const [sortColumn, setSortColumn] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    let ignore = false
    getRegions()
      .then((options) => {
        if (!ignore && options.length > 0) setRegions(options)
      })
      .catch((error) => {
        console.warn('[regions] failed to load regions, using fallback', error)
      })
    return () => {
      ignore = true
    }
  }, [])

  const debouncedSearch = useDebouncedValue(search, 300)

  const { medicalReps, kpis, isLoading } = useMedicalReps({
    page: 1,
    limit: 10,
    search: debouncedSearch,
    status: appliedFilters.status,
    regionId: appliedFilters.regionId || undefined,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
  })
  useRegionTopbarHeader({
    icon: <UserRoundIcon size={20} />,
    title: 'Medical Representatives',
    subtitle:
      'Manage field representatives, region access, and partner onboarding.',
    isLoading,
  })

  const mrKpis = kpis ?? {
    totalMrs: 0,
    activeMrs: 0,
    pendingMrs: 0,
    inactiveMrs: 0,
  }

  const columns: CommonTableColumn<MedicalRepresentative>[] = [
    {
      key: 'name',
      header: 'MR Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {row.name.slice(0, 1)}
          </Avatar>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() =>
              navigate(`/system-users/medical-representatives/${row.id}`)
            }
          >
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      render: (row) => row.email,
    },
    {
      key: 'phone',
      header: 'Phone Number',
      minWidth: 160,
      render: (row) => row.phone,
    },
    {
      key: 'region',
      header: 'Region',
      render: (row) => row.region,
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
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total MRs"
              value={mrKpis.totalMrs}
              icon={<UserRoundIcon size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Active"
              value={mrKpis.activeMrs}
              icon={<UserCheckIcon size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Pending"
              value={mrKpis.pendingMrs}
              icon={<ClockIcon size={20} />}
              iconColor="warning"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Inactive"
              value={mrKpis.inactiveMrs}
              icon={<UserXIcon size={20} />}
              iconColor="error"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        key={`${appliedFilters.regionId || 'all'}-${appliedFilters.status}`}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        tableKey="mrs-list"
        columns={columns}
        rows={medicalReps}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search MRs…"
        searchValue={search}
        onSearchChange={setSearch}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.regionId.trim() ? 1 : 0)
        }
        onExportClick={() => {}}
        createAction={{
          label: 'Create MR',
          to: '/system-users/medical-representatives/new',
        }}
        defaultSortBy="createdAt"
        defaultSortDir="desc"
        actions={[
          {
            label: 'View Details',
            onClick: (row) =>
              navigate(`/system-users/medical-representatives/${row.id}`),
          },
          {
            label: 'Edit',
            onClick: (row) =>
              navigate(`/system-users/medical-representatives/${row.id}/edit`),
          },
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
            <TextField
              select
              label="Region"
              value={draft.regionId}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  regionId: e.target.value,
                }))
              }
              fullWidth
            >
              <MenuItem value="">
                <em>All Regions</em>
              </MenuItem>
              {regions.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as PartnerStatus | 'all',
                }))
              }
              fullWidth
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
