import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Target, Users, Gift, MapPin } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { Modal } from '@/components/common/Modal/Modal'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useSchemes } from '@/features/schemeManagement/hooks/useSchemes'
import { useSchemeFormOptions } from '@/features/schemeManagement/hooks/useSchemeFormOptions'
import {
  schemeDealerTotal,
  schemeChemistTotal,
} from '@/features/schemeManagement/mockSchemes'
import { schemesService } from '@/features/schemeManagement/services/schemesService'
import { useToast } from '@/contexts/ToastContext'
import { radius, transitions } from '@/theme/tokens'
import type { PartnerZone } from '@/types/partner'
import type {
  Scheme,
  SchemePartnerType,
} from '@/features/schemeManagement/types/schemeManagement.types'

type SchemeTab = 'all' | 'general' | 'seasonal'

const SCHEME_TABS: { label: string; value: SchemeTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'General', value: 'general' },
  { label: 'Seasonal', value: 'seasonal' },
]

interface SchemeFilters extends Record<string, unknown> {
  region: PartnerZone | 'all'
  partnerType: SchemePartnerType | 'all'
  fromDate: string
  toDate: string
}

const ALL_ZONES: PartnerZone[] = ['North', 'South', 'East', 'West']

function RegionsCell({ regions }: { regions: string[] }) {
  if (ALL_ZONES.every((zone) => regions.includes(zone))) {
    return <Chip size="small" label="All Regions" variant="outlined" />
  }

  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {regions.map((region) => (
        <Tooltip key={region} title={region}>
          <Chip size="small" label={region.charAt(0)} variant="outlined" />
        </Tooltip>
      ))}
    </Stack>
  )
}

export function SchemesListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { schemes, kpis, isLoading } = useSchemes()
  const { regionOptions, partnerTypeOptions } = useSchemeFormOptions()
  useRegionTopbarHeader({
    icon: <Target size={20} />,
    title: 'Schemes',
    subtitle:
      'Gift redemption schemes for Dealers and Chemists — General (ongoing) and Seasonal (campaign-limited).',
    isLoading,
  })
  const [tab, setTab] = useState<SchemeTab>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Scheme | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<SchemeFilters>({
    region: 'all',
    partnerType: 'all',
    fromDate: '',
    toDate: '',
  })

  const schemeKpis = kpis ?? {
    totalSchemes: 0,
    activeSchemes: 0,
    totalEnrolledPartners: 0,
    totalPointsAllocated: 0,
  }

  const today = new Date().toISOString().slice(0, 10)
  const isSchemeActive = (scheme: Scheme) =>
    scheme.startDate <= today && (!scheme.endDate || scheme.endDate >= today)

  const filteredSchemes = schemes.filter((scheme) => {
    const tabMatch = tab === 'all' || scheme.type === tab
    const statusMatch = statusFilter === 'all' || isSchemeActive(scheme)
    const regionMatch =
      appliedFilters.region === 'all' ||
      scheme.regions.includes(appliedFilters.region)
    const partnerMatch =
      appliedFilters.partnerType === 'all' ||
      scheme.partnerTypes.includes(appliedFilters.partnerType)
    const fromMatch =
      !appliedFilters.fromDate || scheme.startDate >= appliedFilters.fromDate
    const toMatch =
      !appliedFilters.toDate || scheme.startDate <= appliedFilters.toDate
    return (
      tabMatch &&
      statusMatch &&
      regionMatch &&
      partnerMatch &&
      fromMatch &&
      toMatch
    )
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    await schemesService.deleteScheme(deleteTarget.id)
    toast.success('Scheme deleted successfully.')
    setDeleteTarget(null)
  }

  const columns: CommonTableColumn<Scheme>[] = [
    { key: 'id', header: 'Scheme ID', minWidth: 130, render: (row) => row.id },
    {
      key: 'name',
      header: 'Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/scheme-management/schemes/${row.id}`)}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      minWidth: 100,
      render: (row) => (row.type === 'general' ? 'General' : 'Seasonal'),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 110,
      render: (row) =>
        isSchemeActive(row) ? (
          <Chip size="small" label="Active" color="success" />
        ) : (
          <Chip size="small" label="Inactive" color="default" />
        ),
    },
    {
      key: 'partnerTypes',
      header: 'Partner Types',
      minWidth: 140,
      render: (row) => row.partnerTypes.join(', '),
    },
    {
      key: 'regions',
      header: 'Regions',
      minWidth: 180,
      render: (row) => <RegionsCell regions={row.regions} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      minWidth: 120,
      sortable: true,
      render: (row) => row.startDate,
    },
    {
      key: 'endDate',
      header: 'End Date',
      minWidth: 130,
      render: (row) => row.endDate ?? 'No end date',
    },
    {
      key: 'points',
      header: 'Points Required',
      minWidth: 190,
      render: (row) => (
        <Stack spacing={0.25}>
          {row.partnerTypes.includes('Dealer') && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              Dealer: {schemeDealerTotal(row).toLocaleString('en-IN')}
            </Typography>
          )}
          {row.partnerTypes.includes('Chemist') && (
            <Typography variant="caption" sx={{ display: 'block' }}>
              Chemist: {schemeChemistTotal(row).toLocaleString('en-IN')}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      key: 'products',
      header: 'Products',
      minWidth: 180,
      render: (row) =>
        `${row.products.length} product${row.products.length === 1 ? '' : 's'}`,
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
              label="Total Schemes"
              value={schemeKpis.totalSchemes}
              icon={<Target size={20} />}
              iconColor="primary"
              onClick={() => setStatusFilter('all')}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Currently Active"
              value={schemeKpis.activeSchemes}
              icon={<MapPin size={20} />}
              iconColor="success"
              onClick={() => setStatusFilter('active')}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Enrolled Partners"
              value={schemeKpis.totalEnrolledPartners.toLocaleString('en-IN')}
              icon={<Users size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Points Allocated"
              value={schemeKpis.totalPointsAllocated.toLocaleString('en-IN')}
              icon={<Gift size={20} />}
              iconColor="warning"
            />
          )}
        </Grid>
      </Grid>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 2.5,
          p: 0.5,
          width: 'fit-content',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: `${radius.lg}px`,
          backgroundColor: 'background.paper',
        }}
      >
        {SCHEME_TABS.map(({ label, value }) => {
          const active = tab === value
          return (
            <Box
              key={value}
              component="button"
              type="button"
              onClick={() => setTab(value)}
              sx={{
                border: '1px solid',
                borderColor: active ? 'primary.main' : 'transparent',
                cursor: 'pointer',
                px: 2,
                py: 0.75,
                borderRadius: `${radius.md}px`,
                fontSize: '0.8125rem',
                fontWeight: 700,
                fontFamily: 'inherit',
                backgroundColor: active ? 'primary.light' : 'transparent',
                color: active ? 'primary.dark' : 'text.secondary',
                whiteSpace: 'nowrap',
                transition: `background-color ${transitions.base}, color ${transitions.base}, border-color ${transitions.base}`,
                '&:hover': {
                  backgroundColor: active
                    ? 'primary.light'
                    : 'background.default',
                },
              }}
            >
              {label}
              {value !== 'all' && (
                <Box component="span" sx={{ ml: 0.75, opacity: 0.7 }}>
                  ({schemes.filter((s) => s.type === value).length})
                </Box>
              )}
            </Box>
          )
        })}
      </Stack>

      <CommonTable
        tableKey="schemes-list"
        columns={columns}
        rows={filteredSchemes}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search by scheme name or ID…"
        searchKeys={(row) => `${row.name} ${row.id}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.region !== 'all' ? 1 : 0) +
          (appliedFilters.partnerType !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        createAction={{
          label: 'Add Scheme',
          to: '/scheme-management/schemes/new',
        }}
        defaultSortBy="startDate"
        defaultSortDir="desc"
        actions={[
          {
            label: 'View',
            onClick: (row) => navigate(`/scheme-management/schemes/${row.id}`),
          },
          {
            label: 'Edit',
            onClick: (row) =>
              navigate(`/scheme-management/schemes/${row.id}/edit`),
          },
          {
            label: 'Delete',
            onClick: (row) => setDeleteTarget(row),
            danger: true,
          },
        ]}
        emptyTitle="No schemes found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<SchemeFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Schemes"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Region"
              size="small"
              value={draft.region}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  region: e.target.value as SchemeFilters['region'],
                }))
              }
            >
              <MenuItem value="all">All Regions</MenuItem>
              {regionOptions.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Partner Type"
              size="small"
              value={draft.partnerType}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  partnerType: e.target.value as SchemeFilters['partnerType'],
                }))
              }
            >
              <MenuItem value="all">All Partner Types</MenuItem>
              {partnerTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Start Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, fromDate: e.target.value }))
              }
            />
            <TextField
              type="date"
              label="Start Date To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, toDate: e.target.value }))
              }
            />
          </Stack>
        )}
      </FilterDrawer>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Scheme"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={handleDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {deleteTarget?.id} · {deleteTarget?.name}
        </Typography>
      </Modal>
    </>
  )
}
