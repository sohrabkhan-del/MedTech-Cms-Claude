import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Checkbox, FormControlLabel, Grid, Stack, Typography } from '@mui/material'
import {
  BadgeCheck as BadgeCheckIcon,
  UserCheck as UserCheckIcon,
  Clock as ClockIcon,
  UserX as UserXIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useAdmins } from '@/features/systemUsers/hooks/useAdmins'
import type { Admin, AdminRegionAccess, AdminStatus } from '@/features/systemUsers/types/systemUsers.types'

interface AdminFilters extends Record<string, unknown> {
  regions: AdminRegionAccess[]
  statuses: AdminStatus[]
}

const ALL_REGIONS: AdminRegionAccess[] = ['Pan India', 'North', 'South', 'East', 'West']
const ALL_STATUSES: AdminStatus[] = ['active', 'pending', 'inactive']

export function AdminListPage() {
  const navigate = useNavigate()
  const { admins, kpis } = useAdmins()
  useRegionTopbarHeader({
    icon: <BadgeCheckIcon size={20} />,
    title: 'Admin Management',
    subtitle: 'Manage administrator accounts, region access, and account status.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<AdminFilters>({
    regions: [],
    statuses: [],
  })

  const adminKpis = kpis ?? { totalAdmins: 0, activeAdmins: 0, pendingAdmins: 0, inactiveAdmins: 0 }

  const filteredAdmins = admins.filter((admin) => {
    const regionMatch =
      appliedFilters.regions.length === 0 || appliedFilters.regions.includes(admin.regionAccess)
    const statusMatch =
      appliedFilters.statuses.length === 0 || appliedFilters.statuses.includes(admin.status)
    return regionMatch && statusMatch
  })

  const columns: CommonTableColumn<Admin>[] = [
    {
      key: 'name',
      header: 'Admin Name',
      minWidth: 220,
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
            {row.name.slice(0, 1)}
          </Avatar>
          <Typography
            sx={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate(`/system-users/admin/${row.id}`)}
          >
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    { key: 'email', header: 'Email Address', sortable: true, render: (row) => row.email },
    { key: 'phone', header: 'Phone Number', minWidth: 160, render: (row) => row.phone },
    { key: 'regionAccess', header: 'Region Access', sortable: true, render: (row) => row.regionAccess },
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
          <StatCard label="Total Admins" value={adminKpis.totalAdmins} icon={<BadgeCheckIcon size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Active" value={adminKpis.activeAdmins} icon={<UserCheckIcon size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Pending" value={adminKpis.pendingAdmins} icon={<ClockIcon size={20} />} iconColor="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Inactive" value={adminKpis.inactiveAdmins} icon={<UserXIcon size={20} />} iconColor="error" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="admins-list"
        columns={columns}
        rows={filteredAdmins}
        getRowId={(row) => row.id}
        searchPlaceholder="Search admins…"
        searchKeys={(row) => `${row.name} ${row.email} ${row.phone}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={appliedFilters.regions.length + appliedFilters.statuses.length}
        createAction={{ label: 'Create Admin', to: '/system-users/admin/new' }}
        defaultSortBy="name"
        actions={[
          { label: 'View Details', onClick: (row) => navigate(`/system-users/admin/${row.id}`) },
          { label: 'Edit', onClick: (row) => navigate(`/system-users/admin/${row.id}/edit`) },
          { label: 'Activate Admin', onClick: () => {} },
          { label: 'Deactivate Admin', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No admins found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<AdminFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Admins"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Region Access</Typography>
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
