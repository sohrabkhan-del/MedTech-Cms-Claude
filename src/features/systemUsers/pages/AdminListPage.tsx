import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  BadgeCheck as BadgeCheckIcon,
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
import { useAdmins } from '@/features/systemUsers/hooks/useAdmins'
import { useSetAdminStatusMutation } from '@/features/systemUsers/services/adminsApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type {
  Admin,
  AdminStatus,
} from '@/features/systemUsers/types/systemUsers.types'

interface AdminFilters extends Record<string, unknown> {
  status: AdminStatus | 'all'
  regionId: string
}

// Maps CommonTable column keys to the GET /admins `sortBy` field names.
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  name: 'firstName',
  email: 'email',
  status: 'status',
  createdAt: 'createdAt',
}

function formatPhoneNumber(phone?: string | null) {
  if (!phone) return '—'

  const digitsOnly = phone.replace(/\D/g, '')
  if (!digitsOnly) return phone

  if (/^91\d{10,}$/.test(digitsOnly)) {
    return digitsOnly.slice(2)
  }

  if (/^1\d{10,}$/.test(digitsOnly)) {
    return digitsOnly.slice(1)
  }

  return digitsOnly
}

export function AdminListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [setAdminStatus] = useSetAdminStatusMutation()
  const [pendingAdminId, setPendingAdminId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<AdminFilters>({
    status: 'all',
    regionId: '',
  })
  const [sortColumn, setSortColumn] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const effectiveRegionId = appliedFilters.regionId || undefined
  const debouncedSearch = useDebouncedValue(search, 300)

  const { admins, kpis, isLoading } = useAdmins({
    page: 1,
    limit: 10,
    search: debouncedSearch,
    status: appliedFilters.status,
    regionId: effectiveRegionId,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
  })
  useRegionTopbarHeader({
    icon: <BadgeCheckIcon size={20} />,
    title: 'Admin Management',
    subtitle:
      'Manage administrator accounts, region access, and account status.',
    isLoading,
  })

  const adminKpis = kpis ?? {
    totalAdmins: 0,
    activeAdmins: 0,
    pendingAdmins: 0,
    inactiveAdmins: 0,
  }

  async function handleSetStatus(admin: Admin, status: AdminStatus) {
    setPendingAdminId(admin.id)
    try {
      await setAdminStatus({ id: admin.id, status }).unwrap()
      toast.success(
        status === 'active'
          ? 'Admin activated successfully.'
          : 'Admin deactivated successfully.',
      )
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          status === 'active'
            ? 'Failed to activate admin.'
            : 'Failed to deactivate admin.',
        ),
      )
    } finally {
      setPendingAdminId(null)
    }
  }

  const columns: CommonTableColumn<Admin>[] = [
    {
      key: 'name',
      header: 'Admin Name',
      minWidth: 220,
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
            onClick={() => navigate(`/system-users/admin/${row.id}`)}
          >
            {row.name}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      render: (row) => row.email,
    },
    {
      key: 'phone',
      header: 'Phone Number',
      minWidth: 160,
      render: (row) => formatPhoneNumber(row.phone),
    },
    {
      key: 'regionAccess',
      header: 'Region Access',
      sortable: true,
      render: (row) => row.regionAccess,
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
              label="Total Admins"
              value={adminKpis.totalAdmins}
              icon={<BadgeCheckIcon size={20} />}
              iconColor="primary"
              onClick={() =>
                setAppliedFilters((prev) => ({ ...prev, status: 'all' }))
              }
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Active"
              value={adminKpis.activeAdmins}
              icon={<UserCheckIcon size={20} />}
              iconColor="success"
              onClick={() =>
                setAppliedFilters((prev) => ({ ...prev, status: 'active' }))
              }
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Pending"
              value={adminKpis.pendingAdmins}
              icon={<ClockIcon size={20} />}
              iconColor="warning"
              onClick={() =>
                setAppliedFilters((prev) => ({ ...prev, status: 'pending' }))
              }
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Inactive"
              value={adminKpis.inactiveAdmins}
              icon={<UserXIcon size={20} />}
              iconColor="error"
              onClick={() =>
                setAppliedFilters((prev) => ({ ...prev, status: 'inactive' }))
              }
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        key={`${effectiveRegionId ?? 'all'}-${appliedFilters.status}`}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        tableKey="admins-list"
        columns={columns}
        rows={admins}
        getRowId={(row) => row.id}
        loading={isLoading}
        isRowActionLoading={(row) => row.id === pendingAdminId}
        searchPlaceholder="Search admins…"
        searchValue={search}
        onSearchChange={setSearch}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.regionId.trim() ? 1 : 0)
        }
        createAction={{ label: 'Create Admin', to: '/system-users/admin/new' }}
        defaultSortBy="createdAt"
        actions={[
          {
            label: 'View Details',
            onClick: (row) => navigate(`/system-users/admin/${row.id}`),
          },
          {
            label: 'Edit',
            onClick: (row) => navigate(`/system-users/admin/${row.id}/edit`),
          },
          {
            label: 'Activate Admin',
            hidden: (row) => row.status === 'active',
            onClick: (row) => handleSetStatus(row, 'active'),
          },
          {
            label: 'Deactivate Admin',
            danger: true,
            hidden: (row) => row.status !== 'active',
            onClick: (row) => handleSetStatus(row, 'inactive'),
          },
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
        onReset={() => {
          setAppliedFilters({ status: 'all', regionId: '' })
          setFilterOpen(false)
        }}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Status"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as AdminStatus | 'all',
                }))
              }
              fullWidth
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
