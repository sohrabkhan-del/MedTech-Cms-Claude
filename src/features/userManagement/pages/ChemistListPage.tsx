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
import type { PartnerZone, PartnerStatus } from '@/types/partner'

interface ChemistFilters extends Record<string, unknown> {
  zone: PartnerZone | 'all'
  status: PartnerStatus | 'all'
}

export function ChemistListPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()
  const { chemists, kpis } = useChemists()
  useRegionTopbarHeader({
    icon: <LocalPharmacyIcon size={20} />,
    title: 'Chemists',
    subtitle: 'Registered chemist partners with geo-tagged shops.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ChemistFilters>({
    zone: 'all',
    status: 'all',
  })

  const regionZone = region === 'All India' ? null : (region as PartnerZone)

  const chemistKpis = kpis ?? {
    totalChemists: 0,
    activeChemists: 0,
    inactiveChemists: 0,
    pendingApproval: 0,
  }

  const filteredChemists = chemists.filter((chemist) => {
    const regionMatch = !regionZone || chemist.zone === regionZone
    const zoneMatch =
      appliedFilters.zone === 'all' || chemist.zone === appliedFilters.zone
    const statusMatch =
      appliedFilters.status === 'all' || chemist.status === appliedFilters.status
    return regionMatch && zoneMatch && statusMatch
  })

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
      header: 'License Number',
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
      key: 'availableCoins',
      header: 'Available Coins',
      minWidth: 100,
      align: 'center',
      sortable: true,
      sortValue: (row) => row.availableCoins,
      render: (row) => row.availableCoins.toLocaleString('en-IN'),
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Chemist"
            value={chemistKpis.totalChemists}
            icon={<LocalPharmacyIcon size={20} />}
            iconColor="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Active Chemist"
            value={chemistKpis.activeChemists}
            icon={<ActiveChemistIcon size={20} />}
            iconColor="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Inactive Chemist"
            value={chemistKpis.inactiveChemists}
            icon={<InactiveChemistIcon size={20} />}
            iconColor="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Pending Approval"
            value={chemistKpis.pendingApproval}
            icon={<PendingActionsOutlinedIcon size={20} />}
            iconColor="warning"
          />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="chemists-list"
        columns={columns}
        rows={filteredChemists}
        getRowId={(row) => row.id}
        searchPlaceholder="Search chemists…"
        searchKeys={(row) =>
          `${row.shopName} ${row.ownerName} ${row.email} ${row.city}`
        }
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.zone !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0)
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
              select
              label="Zone"
              value={draft.zone}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  zone: e.target.value as PartnerZone | 'all',
                }))
              }
              fullWidth
            >
              <MenuItem value="all">All Zones</MenuItem>
              <MenuItem value="North">North</MenuItem>
              <MenuItem value="South">South</MenuItem>
              <MenuItem value="East">East</MenuItem>
              <MenuItem value="West">West</MenuItem>
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
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
