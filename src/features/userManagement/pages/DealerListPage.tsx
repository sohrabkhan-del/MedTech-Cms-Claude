import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import {
  Store as StorefrontIcon,
  CheckCircle2 as ActiveDealerIcon,
  XCircle as InactiveDealerIcon,
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
import { useDealers } from '@/features/userManagement/hooks/useDealers'
import type { Dealer, PartnerZone, PartnerStatus } from '@/features/userManagement/types/userManagement.types'

interface DealerFilters extends Record<string, unknown> {
  zones: PartnerZone[]
  statuses: PartnerStatus[]
}

const ALL_ZONES: PartnerZone[] = ['North', 'South', 'East', 'West']
const ALL_STATUSES: PartnerStatus[] = ['active', 'pending', 'inactive']

export function DealerListPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()
  const { dealers, kpis } = useDealers()
  useRegionTopbarHeader({
    icon: <StorefrontIcon size={20} />,
    title: 'Dealers',
    subtitle: 'Registered dealer partners across the network.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<DealerFilters>({
    zones: [],
    statuses: [],
  })

  const regionZone = region === 'All India' ? null : (region as PartnerZone)

  const dealerKpis = kpis ?? {
    totalDealers: 0,
    activeDealers: 0,
    inactiveDealers: 0,
    pendingApproval: 0,
  }

  const filteredDealers = dealers.filter((dealer) => {
    const regionMatch = !regionZone || dealer.zone === regionZone
    const zoneMatch =
      appliedFilters.zones.length === 0 ||
      appliedFilters.zones.includes(dealer.zone)
    const statusMatch =
      appliedFilters.statuses.length === 0 ||
      appliedFilters.statuses.includes(dealer.status)
    return regionMatch && zoneMatch && statusMatch
  })

  const columns: CommonTableColumn<Dealer>[] = [
    {
      key: 'shopName',
      header: 'Godown Name',
      minWidth: 220,
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
            onClick={() => navigate(`/partners/dealers/${row.id}`)}
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
      header: 'Email',
      sortable: true,
      render: (row) => row.email,
    },
    {
      key: 'phone',
      header: 'Phone',
      minWidth: 160,
      render: (row) => row.phone,
    },
    {
      key: 'city',
      header: 'Location',
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
      key: 'licenseNumber',
      header: 'License Number',
      render: (row) => row.licenseNumber,
    },
    {
      key: 'onboardedBy',
      header: 'Onboarded',
      sortable: true,
      render: (row) => row.onboardedBy,
    },
    {
      key: 'availableCoins',
      header: 'Available Coins',
      align: 'center',
      minWidth: 100,
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
            label="Total Dealer"
            value={dealerKpis.totalDealers}
            icon={<StorefrontIcon size={20} />}
            iconColor="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Active Dealer"
            value={dealerKpis.activeDealers}
            icon={<ActiveDealerIcon size={20} />}
            iconColor="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Inactive Dealer"
            value={dealerKpis.inactiveDealers}
            icon={<InactiveDealerIcon size={20} />}
            iconColor="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Pending Approval"
            value={dealerKpis.pendingApproval}
            icon={<PendingActionsOutlinedIcon size={20} />}
            iconColor="warning"
          />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="dealers-list"
        columns={columns}
        rows={filteredDealers}
        loading
        getRowId={(row) => row.id}
        searchPlaceholder="Search dealers…"
        searchKeys={(row) =>
          `${row.shopName} ${row.ownerName} ${row.email} ${row.city}`
        }
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          appliedFilters.zones.length + appliedFilters.statuses.length
        }
        onExportClick={() => {}}
        onImportClick={() => {}}
        createAction={{ label: 'Create Dealer', to: '/partners/dealers/new' }}
        defaultSortBy="shopName"
        actions={[
          {
            label: 'View Details',
            onClick: (row) => navigate(`/partners/dealers/${row.id}`),
          },
          {
            label: 'Edit',
            onClick: (row) => navigate(`/partners/dealers/${row.id}/edit`),
          },
          { label: 'Deactivate', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No dealers found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<DealerFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Dealers"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                Zone
              </Typography>
              {ALL_ZONES.map((zone) => (
                <FormControlLabel
                  key={zone}
                  control={
                    <Checkbox
                      checked={draft.zones.includes(zone)}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          zones: e.target.checked
                            ? [...prev.zones, zone]
                            : prev.zones.filter((z) => z !== zone),
                        }))
                      }
                    />
                  }
                  label={zone}
                />
              ))}
            </Stack>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                Status
              </Typography>
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
