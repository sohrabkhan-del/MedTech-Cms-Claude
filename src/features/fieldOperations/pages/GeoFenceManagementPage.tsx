import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Fence as FenceIcon,
  CircleCheck as CheckCircleOutlined,
  ClipboardClock as PendingActionsOutlined,
  Target as TrackChangesIcon,
  CircleDashed,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { useGeoFences } from '@/features/fieldOperations/hooks/useGeoFences'
import {
  useActivateDealerMutation,
  useDeactivateDealerMutation,
} from '@/features/userManagement/services/dealerApi'
import {
  useActivateChemistMutation,
  useDeactivateChemistMutation,
} from '@/features/userManagement/services/chemistApi'
import type {
  GeoFence,
  GeoFenceUserType,
} from '@/features/fieldOperations/types/fieldOperations.types'
import type { PartnerZone } from '@/types/partner'

const partnerBasePath: Record<'Dealer' | 'Chemist', string> = {
  Dealer: '/partners/dealers',
  Chemist: '/partners/chemists',
}

interface GeoFenceFilters extends Record<string, unknown> {
  userType: GeoFenceUserType | 'all'
  region: PartnerZone | 'all'
  status: GeoFence['status'] | 'all'
}

type RuleTab = 'all' | 'Chemist' | 'Dealer'

const RULE_TABS: { label: string; value: RuleTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Chemist', value: 'Chemist' },
  { label: 'Dealer', value: 'Dealer' },
]

export function GeoFenceManagementPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { region } = useRegionFilter()
  const [tab, setTab] = useState<RuleTab>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const debouncedSearch = useDebouncedValue(search, 300)
  const {
    geoFences,
    totalCount,
    analyticsCards,
    isLoading,
    isAnalyticsCardsLoading,
    refetch,
  } = useGeoFences(
    tab === 'all' ? undefined : tab,
    debouncedSearch || undefined,
    page + 1,
    rowsPerPage,
  )
  useRegionTopbarHeader({
    icon: <FenceIcon size={20} />,
    title: 'Geo Fence Management',
    subtitle:
      'Manage location-based scan validation for Dealers, Chemists, and MRs.',
    isLoading,
  })
  const [activateDealer] = useActivateDealerMutation()
  const [deactivateDealer] = useDeactivateDealerMutation()
  const [activateChemist] = useActivateChemistMutation()
  const [deactivateChemist] = useDeactivateChemistMutation()
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, GeoFence['status']>
  >({})

  function clearStatusOverride(id: string) {
    setStatusOverrides((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  async function handleActivate(row: GeoFence) {
    setStatusOverrides((prev) => ({ ...prev, [row.id]: 'active' }))
    try {
      if (row.userType === 'Dealer') await activateDealer(row.id).unwrap()
      else if (row.userType === 'Chemist')
        await activateChemist(row.id).unwrap()
      toast.success(`${row.userType} activated successfully.`)
      await refetch()
      clearStatusOverride(row.id)
    } catch (err) {
      clearStatusOverride(row.id)
      toast.error(
        getApiErrorMessage(
          err,
          `Failed to activate ${row.userType.toLowerCase()}.`,
        ),
      )
    }
  }

  async function handleDeactivate(row: GeoFence) {
    setStatusOverrides((prev) => ({ ...prev, [row.id]: 'inactive' }))
    try {
      if (row.userType === 'Dealer') await deactivateDealer(row.id).unwrap()
      else if (row.userType === 'Chemist')
        await deactivateChemist(row.id).unwrap()
      toast.success(`${row.userType} deactivated successfully.`)
      await refetch()
      clearStatusOverride(row.id)
    } catch (err) {
      clearStatusOverride(row.id)
      toast.error(
        getApiErrorMessage(
          err,
          `Failed to deactivate ${row.userType.toLowerCase()}.`,
        ),
      )
    }
  }
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<GeoFenceFilters>({
    userType: 'all',
    region: 'all',
    status: 'all',
  })

  const topbarZone = region === 'All India' ? null : (region as PartnerZone)

  const displayedFences = geoFences.map((fence) =>
    statusOverrides[fence.id]
      ? { ...fence, status: statusOverrides[fence.id]! }
      : fence,
  )

  const createAction = {
    label: 'Update Geo Fence Rule',
    to:
      tab === 'all'
        ? '/field-operations/geo-fence-management/new?scope=global'
        : `/field-operations/geo-fence-management/new?scope=global&userType=${tab}`,
  }

  function partnerDetailPath(row: GeoFence): string | null {
    if (row.userType !== 'Dealer' && row.userType !== 'Chemist') return null
    return `${partnerBasePath[row.userType]}/${row.id}`
  }

  function geoFenceEditPath(row: GeoFence): string {
    return `/field-operations/geo-fence-management/${row.id}/edit`
  }

  const columns: CommonTableColumn<GeoFence>[] = [
    {
      key: 'businessName',
      header: 'Business Name',
      minWidth: 170,
      sortable: true,
      render: (row) => {
        const path = partnerDetailPath(row)
        return (
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: path ? 'pointer' : 'default',
              '&:hover': path ? { textDecoration: 'underline' } : undefined,
            }}
            onClick={path ? () => navigate(path) : undefined}
          >
            {row.businessName}
          </Typography>
        )
      },
    },
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 160,
      sortable: true,
      render: (row) => row.userName,
    },
    {
      key: 'businessAddress',
      header: 'Business Address',
      minWidth: 220,
      render: (row) => (
        <Typography
          noWrap
          sx={{
            fontSize: '0.8125rem',
            maxWidth: 260,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={row.businessAddress}
        >
          {row.businessAddress}
        </Typography>
      ),
    },
    {
      key: 'userType',
      header: 'User Type',
      sortable: true,
      render: (row) => row.userType,
    },
    {
      key: 'zone',
      header: 'Location',
      sortable: true,
      render: (row) => row.zone,
    },
    {
      key: 'radiusMeters',
      header: 'Radius (mt)',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.radiusMeters,
      render: (row) => row.radiusMeters,
    },
    {
      key: 'lastVerified',
      header: 'Last Verified',
      minWidth: 140,
      render: (row) => row.lastVerified,
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
          {isAnalyticsCardsLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Active Geo Fences"
              value={analyticsCards?.activeGeoFences ?? 0}
              icon={<CheckCircleOutlined size={20} />}
              iconColor="success"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, status: 'active' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isAnalyticsCardsLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Pending Verification"
              value={analyticsCards?.pendingVerification ?? 0}
              icon={<PendingActionsOutlined size={20} />}
              iconColor="warning"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, status: 'pending' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isAnalyticsCardsLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Average Radius"
              value={`${analyticsCards?.averageRadius ?? 0} m`}
              icon={<TrackChangesIcon size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isAnalyticsCardsLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Average Buffer Radius"
              value={`${analyticsCards?.averageBufferRadius ?? 0} m`}
              icon={<CircleDashed size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
      </Grid>

      <Box sx={{ mb: 2.5, mt: 7 }}>
        <ModularTabs
          variant="underline"
          tabs={RULE_TABS}
          value={tab}
          onChange={setTab}
        />
      </Box>

      <CommonTable
        tableKey="geo-fence-list"
        columns={columns}
        rows={displayedFences}
        totalCount={totalCount}
        page={page}
        onPageChange={(nextPage) => {
          setPage(nextPage)
        }}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(nextRowsPerPage) => {
          setRowsPerPage(nextRowsPerPage)
          setPage(0)
        }}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search geo fences…"
        searchValue={search}
        onSearchChange={(nextValue) => {
          setSearch(nextValue)
          setPage(0)
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.userType !== 'all' ? 1 : 0) +
          (appliedFilters.region !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0)
        }
        onExportClick={() => {}}
        createAction={createAction}
        defaultSortBy="businessName"
        actions={[
          {
            label: 'View',
            hidden: (row) => !partnerDetailPath(row),
            onClick: (row) => {
              const path = partnerDetailPath(row)
              if (path) navigate(path)
            },
          },
          {
            label: 'Edit',
            onClick: (row) => navigate(geoFenceEditPath(row)),
          },
          {
            label: 'Activate',
            hidden: (row) => row.status === 'active',
            onClick: handleActivate,
          },
          {
            label: 'Deactivate',
            danger: true,
            hidden: (row) => row.status !== 'active',
            onClick: handleDeactivate,
          },
        ]}
        emptyTitle="No geo fences found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<GeoFenceFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Geo Fences"
        value={appliedFilters}
        onApply={(next) => {
          setAppliedFilters(next)
          setPage(0)
        }}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="User Type"
              size="small"
              value={draft.userType}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  userType: e.target.value as GeoFenceFilters['userType'],
                }))
              }
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
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  region: e.target.value as GeoFenceFilters['region'],
                }))
              }
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
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as GeoFenceFilters['status'],
                }))
              }
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
