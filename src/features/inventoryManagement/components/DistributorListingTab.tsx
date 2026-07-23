import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Truck, MapPin as MapPinOutlined, Building2 } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import type { DistributorRecord } from '@/types/distributorUpload'

interface DistributorListingFilters extends Record<string, unknown> {
  region: DistributorRecord['region'] | 'all'
  city: string
}

interface DistributorListingTabProps {
  distributors: DistributorRecord[]
  isLoading: boolean
}

const regions: DistributorRecord['region'][] = [
  'North',
  'South',
  'East',
  'West',
]

export function DistributorListingTab({
  distributors,
  isLoading,
}: DistributorListingTabProps) {
  const navigate = useNavigate()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] =
    useState<DistributorListingFilters>({ region: 'all', city: '' })

  const cityCount = useMemo(
    () => new Set(distributors.map((d) => d.city)).size,
    [distributors],
  )

  const filteredDistributors = useMemo(
    () =>
      distributors.filter((d) => {
        const regionMatch =
          appliedFilters.region === 'all' || d.region === appliedFilters.region
        const cityMatch =
          !appliedFilters.city ||
          d.city.toLowerCase().includes(appliedFilters.city.toLowerCase())
        return regionMatch && cityMatch
      }),
    [distributors, appliedFilters],
  )

  const columns: CommonTableColumn<DistributorRecord>[] = [
    {
      key: 'distributorCode',
      header: 'Distributor Code',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.distributorCode,
      render: (row) => row.distributorCode,
    },
    {
      key: 'distributorName',
      header: 'Distributor Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.distributorName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/distributor-upload/${row.id}`)}
        >
          {row.distributorName}
        </Typography>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      minWidth: 150,
      render: (row) => row.contactPerson,
    },
    {
      key: 'phone',
      header: 'Phone',
      minWidth: 120,
      render: (row) => row.phone,
    },
    {
      key: 'city',
      header: 'City',
      minWidth: 110,
      sortable: true,
      sortValue: (row) => row.city,
      render: (row) => row.city,
    },
    {
      key: 'region',
      header: 'Region',
      minWidth: 100,
      sortable: true,
      sortValue: (row) => row.region,
      render: (row) => row.region,
    },
    {
      key: 'gstNumber',
      header: 'GST Number',
      minWidth: 160,
      render: (row) => row.gstNumber,
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 110,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'uploadedDate',
      header: 'Uploaded Date',
      minWidth: 130,
      render: (row) => row.uploadedDate,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Distributors"
              value={distributors.length}
              icon={<Truck size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Cities Covered"
              value={cityCount}
              icon={<MapPinOutlined size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Regions Covered"
              value={new Set(distributors.map((d) => d.region)).size}
              icon={<Building2 size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="distributor-listing"
        columns={columns}
        rows={filteredDistributors}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by distributor name, code or city…"
        searchKeys={(row) =>
          `${row.distributorName} ${row.distributorCode} ${row.city}`
        }
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.region !== 'all' ? 1 : 0) +
          (appliedFilters.city ? 1 : 0)
        }
        actions={[
          {
            label: 'View Details',
            onClick: (row) => navigate(`/distributor-upload/${row.id}`),
          },
        ]}
        onExportClick={() => {}}
        defaultSortBy="distributorName"
        emptyTitle={
          distributors.length === 0
            ? 'No distributors uploaded yet'
            : 'No distributors found'
        }
        emptyDescription={
          distributors.length === 0
            ? 'Use "Upload Distributor Batches" to import distributor master data.'
            : 'Try adjusting your filters or search terms.'
        }
      />

      <FilterDrawer<DistributorListingFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Distributors"
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
                  region: e.target.value as DistributorListingFilters['region'],
                }))
              }
            >
              <MenuItem value="all">All Regions</MenuItem>
              {regions.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="City"
              size="small"
              value={draft.city}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, city: e.target.value }))
              }
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
