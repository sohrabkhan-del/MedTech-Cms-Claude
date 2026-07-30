import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Pill as LocalPharmacyIcon,
  CheckCircle2 as ActiveChemistIcon,
  XCircle as InactiveChemistIcon,
  ClipboardClock as PendingActionsOutlinedIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useChemists } from '@/features/userManagement/hooks/useChemists'
import type { Chemist } from '@/types/chemist'
import type { PartnerStatus } from '@/types/partner'

interface ChemistFilters extends Record<string, unknown> {
  status: PartnerStatus | 'all'
  territoryId: string
  assignedMedicalRepresentativeId: string
}

export function ChemistListPage() {
  const navigate = useNavigate()
  const { regionId } = useRegionFilter()
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ChemistFilters>({
    status: 'all',
    territoryId: '',
    assignedMedicalRepresentativeId: '',
  })
  const { chemists, kpis, isLoading } = useChemists({
    page: 1,
    limit: 10,
    search,
    status: appliedFilters.status,
    regionId: regionId ?? undefined,
    territoryId: appliedFilters.territoryId,
    assignedMedicalRepresentativeId:
      appliedFilters.assignedMedicalRepresentativeId,
    sortOrder: 'desc',
  })
  useRegionTopbarHeader({
    icon: <LocalPharmacyIcon size={20} />,
    title: 'Chemists',
    subtitle: 'Registered chemist partners with geo-tagged shops.',
    isLoading,
  })

  const chemistKpis = kpis ?? {
    totalChemists: 0,
    activeChemists: 0,
    inactiveChemists: 0,
    pendingApproval: 0,
  }

  const columns: CommonTableColumn<Chemist>[] = [
    {
      key: 'shopName',
      header: 'Chemist Shop Name',
      sortable: true,
      sortValue: (row) => row.shopName,
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
            {row.shopName.slice(0, 1)}
          </Avatar>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => navigate(`/partners/chemists/${row.id}`)}
          >
            {row.shopName}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'ownerName',
      header: 'Owner Name',
      sortable: true,
      render: (row) => row.ownerName,
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
      render: (row) => row.phone,
    },
    {
      key: 'city',
      header: 'Location (City)',
      sortable: true,
      render: (row) => row.city,
    },
    { key: 'zone', header: 'Zone', sortable: true, render: (row) => row.zone },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'geoLock',
      header: 'Geo-lock Status',
      sortable: true,
      sortValue: (row) => (row.geoLock.active ? 1 : 0),
      render: (row) => (
        <Chip
          label={row.geoLock.active ? 'Locked' : 'Unlocked'}
          size="small"
          color={row.geoLock.active ? 'success' : 'warning'}
          variant="filled"
        />
      ),
    },
    {
      key: 'licenseNumber',
      header: 'GSTN Number',
      render: (row) => row.licenseNumber,
    },
    {
      key: 'onboardedBy',
      header: 'Onboarded',
      sortable: true,
      align: 'center',
      render: (row) => row.onboardedBy,
    },
    {
      key: 'availablePoints',
      header: 'Points Earned',
      minWidth: 100,
      align: 'center',
      sortable: true,
      sortValue: (row) => row.availablePoints,
      render: (row) => row.availablePoints.toLocaleString('en-IN'),
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
              label="Total Chemist"
              value={chemistKpis.totalChemists}
              icon={<LocalPharmacyIcon size={20} />}
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
              label="Active Chemist"
              value={chemistKpis.activeChemists}
              icon={<ActiveChemistIcon size={20} />}
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
              label="Inactive Chemist"
              value={chemistKpis.inactiveChemists}
              icon={<InactiveChemistIcon size={20} />}
              iconColor="error"
              onClick={() =>
                setAppliedFilters((prev) => ({ ...prev, status: 'inactive' }))
              }
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Pending Approval"
              value={chemistKpis.pendingApproval}
              icon={<PendingActionsOutlinedIcon size={20} />}
              iconColor="warning"
              onClick={() =>
                setAppliedFilters((prev) => ({ ...prev, status: 'pending' }))
              }
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        key={`${regionId ?? 'all'}-${search}-${appliedFilters.status}-${appliedFilters.territoryId}-${appliedFilters.assignedMedicalRepresentativeId}`}
        tableKey="chemists-list"
        columns={columns}
        rows={chemists}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search chemists…"
        searchValue={search}
        onSearchChange={setSearch}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.territoryId.trim() ? 1 : 0) +
          (appliedFilters.assignedMedicalRepresentativeId.trim() ? 1 : 0)
        }
        onExportClick={() => {}}
        onImportClick={() => {}}
        createAction={{ label: 'Create Chemist', to: '/partners/chemists/new' }}
        defaultSortBy="shopName"
        actions={[
          {
            label: 'View Chemist',
            onClick: (row) => navigate(`/partners/chemists/${row.id}`),
          },
          {
            label: 'Edit Chemist',
            onClick: (row) => navigate(`/partners/chemists/${row.id}/edit`),
          },
          { label: 'Activate Chemist', onClick: () => {} },
          { label: 'Deactivate Chemist', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No chemists found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<ChemistFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Chemists"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              label="Territory ID"
              value={draft.territoryId}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  territoryId: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="Assigned MR ID"
              value={draft.assignedMedicalRepresentativeId}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  assignedMedicalRepresentativeId: e.target.value,
                }))
              }
              fullWidth
            />
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
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
