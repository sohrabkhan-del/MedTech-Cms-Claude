import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Autocomplete,
  Avatar,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Store as StorefrontIcon,
  CheckCircle2 as ActiveDealerIcon,
  XCircle as InactiveDealerIcon,
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
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDealers } from '@/features/userManagement/hooks/useDealers'
import {
  useActivateDealerMutation,
  useDeactivateDealerMutation,
} from '@/features/userManagement/services/dealerApi'
import { useGetMedicalRepOptionsQuery } from '@/features/systemUsers/services/medicalRepsApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fallbackRegions, getRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import type { Dealer } from '@/types/dealer'
import type { PartnerStatus } from '@/types/partner'

interface DealerFilters extends Record<string, unknown> {
  status: PartnerStatus | 'all'
  assignedMedicalRepresentativeId: string
  regionId: string
}

// Maps CommonTable column keys to the real GET /partners `sortBy` field
// names. UNVERIFIED against the backend — best-effort guess based on the
// API's own request/response field names (businessName, ownerFirstName,
// city, status). `zone` has no backend equivalent (it's inferred
// client-side from `state`), so it's omitted and not server-sortable.
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  shopName: 'businessName',
  ownerName: 'ownerFirstName',
  city: 'city',
  status: 'status',
}

export function DealerListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { regionId: topbarRegionId } = useRegionFilter()
  const [activateDealer] = useActivateDealerMutation()
  const [deactivateDealer] = useDeactivateDealerMutation()
  const { data: mrOptions = [] } = useGetMedicalRepOptionsQuery()
  const [regions, setRegions] = useState<RegionOption[]>(fallbackRegions)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<DealerFilters>({
    status: 'all',
    assignedMedicalRepresentativeId: '',
    regionId: '',
  })
  const [sortColumn, setSortColumn] = useState('shopName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

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

  const effectiveRegionId = appliedFilters.regionId || topbarRegionId || undefined
  const debouncedSearch = useDebouncedValue(search, 300)

  const { dealers, totalItems, kpis, isLoading } = useDealers({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    status: appliedFilters.status,
    regionId: effectiveRegionId,
    assignedMedicalRepresentativeId:
      appliedFilters.assignedMedicalRepresentativeId,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
  })
  useRegionTopbarHeader({
    icon: <StorefrontIcon size={20} />,
    title: 'Dealers',
    subtitle: 'Registered dealer partners across the network.',
    isLoading,
  })

  const dealerKpis = kpis ?? {
    totalDealers: 0,
    activeDealers: 0,
    inactiveDealers: 0,
    pendingApproval: 0,
  }

  const columns: CommonTableColumn<Dealer>[] = [
    {
      key: 'shopName',
      header: 'Business Name',
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
    { key: 'zone', header: 'Zone', render: (row) => row.zone },
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
              label="Total Dealer"
              value={dealerKpis.totalDealers}
              icon={<StorefrontIcon size={20} />}
              iconColor="primary"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, status: 'all' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Active Dealer"
              value={dealerKpis.activeDealers}
              icon={<ActiveDealerIcon size={20} />}
              iconColor="success"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, status: 'active' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Inactive Dealer"
              value={dealerKpis.inactiveDealers}
              icon={<InactiveDealerIcon size={20} />}
              iconColor="error"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, status: 'inactive' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Pending Approval"
              value={dealerKpis.pendingApproval}
              icon={<PendingActionsOutlinedIcon size={20} />}
              iconColor="warning"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, status: 'pending' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        key={`${effectiveRegionId ?? 'all'}-${appliedFilters.status}-${appliedFilters.assignedMedicalRepresentativeId}`}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        totalCount={totalItems}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        tableKey="dealers-list"
        columns={columns}
        rows={dealers}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search dealers…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.assignedMedicalRepresentativeId.trim() ? 1 : 0) +
          (appliedFilters.regionId.trim() ? 1 : 0)
        }
        onExportClick={() => {}}
        onImportClick={() => {}}
        createAction={{ label: 'Create Dealer', to: '/partners/dealers/new' }}
        defaultSortBy="shopName"
        defaultSortDir="desc"
        actions={[
          {
            label: 'View Dealer',
            onClick: (row) => navigate(`/partners/dealers/${row.id}`),
          },
          {
            label: 'Edit Dealer',
            onClick: (row) => navigate(`/partners/dealers/${row.id}/edit`),
          },
          {
            label: 'Activate Dealer',
            hidden: (row) => row.status === 'active',
            onClick: async (row) => {
              try {
                await activateDealer(row.id).unwrap()
                toast.success('Dealer activated successfully.')
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to activate dealer.'))
              }
            },
          },
          {
            label: 'Deactivate Dealer',
            danger: true,
            hidden: (row) => row.status !== 'active',
            onClick: async (row) => {
              try {
                await deactivateDealer(row.id).unwrap()
                toast.success('Dealer deactivated successfully.')
              } catch (err) {
                toast.error(getApiErrorMessage(err, 'Failed to deactivate dealer.'))
              }
            },
          },
        ]}
        emptyTitle="No dealers found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<DealerFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Dealers"
        value={appliedFilters}
        onApply={(next) => {
          setAppliedFilters(next)
          setPage(0)
        }}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <Autocomplete
              options={mrOptions}
              getOptionLabel={(option) =>
                option.employeeCode ? `${option.name} (${option.employeeCode})` : option.name
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={
                mrOptions.find(
                  (mr) => mr.id === draft.assignedMedicalRepresentativeId,
                ) ?? null
              }
              onChange={(_, selected) =>
                setDraft((prev) => ({
                  ...prev,
                  assignedMedicalRepresentativeId: selected?.id ?? '',
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Assigned MR" placeholder="Search medical representatives…" />
              )}
            />
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
