import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  FileBarChart2,
  Store as StorefrontIcon,
  ScanLine,
  Coins,
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
import {
  mockDealerReports,
  dealerReportKpis,
} from '@/features/reportsAnalytics/mockDealerReports'
import type { DealerReportRow } from '@/types/dealerReport'
import type { PartnerStatus, PartnerZone } from '@/types/partner'

const ALL_ZONES: PartnerZone[] = ['North', 'South', 'East', 'West']
const ALL_STATUSES: PartnerStatus[] = ['active', 'pending', 'inactive']

interface DealerReportFilters extends Record<string, unknown> {
  zones: PartnerZone[]
  statuses: PartnerStatus[]
  city: string
  fromDate: string
  toDate: string
}

export function DealerReportListPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()
  useRegionTopbarHeader({
    icon: <FileBarChart2 size={20} />,
    title: 'Dealer Reports',
    subtitle:
      'Displays dealer onboarding, scan activity, and reward performance.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<DealerReportFilters>({
    zones: [],
    statuses: [],
    city: '',
    fromDate: '',
    toDate: '',
  })

  const regionZone = region === 'All India' ? null : (region as PartnerZone)

  const filteredRows = useMemo(
    () =>
      mockDealerReports.filter((row) => {
        const regionMatch = !regionZone || row.zone === regionZone
        const zoneMatch =
          appliedFilters.zones.length === 0 ||
          appliedFilters.zones.includes(row.zone)
        const statusMatch =
          appliedFilters.statuses.length === 0 ||
          appliedFilters.statuses.includes(row.status)
        const cityMatch =
          !appliedFilters.city ||
          row.city.toLowerCase().includes(appliedFilters.city.toLowerCase())
        return regionMatch && zoneMatch && statusMatch && cityMatch
      }),
    [appliedFilters, regionZone],
  )

  const columns: CommonTableColumn<DealerReportRow>[] = [
    {
      key: 'dealerName',
      header: 'Dealer Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.dealerName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/reports/dealer-reports/${row.id}`)}
        >
          {row.dealerName}
        </Typography>
      ),
    },
    {
      key: 'city',
      header: 'City',
      minWidth: 120,
      sortable: true,
      render: (row) => row.city,
    },
    {
      key: 'zone',
      header: 'Zone',
      minWidth: 90,
      sortable: true,
      render: (row) => row.zone,
    },
    {
      key: 'totalScans',
      header: 'Total Scans',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.totalScans,
      render: (row) => row.totalScans.toLocaleString('en-IN'),
    },
    {
      key: 'walletPoints',
      header: 'Wallet Points',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.walletPoints,
      render: (row) => row.walletPoints.toLocaleString('en-IN'),
    },
    {
      key: 'redemptions',
      header: 'Redemptions',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.redemptions,
      render: (row) => row.redemptions.toLocaleString('en-IN'),
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 100,
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  const filterCount =
    appliedFilters.zones.length +
    appliedFilters.statuses.length +
    (appliedFilters.city ? 1 : 0) +
    (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Dealers"
            value={dealerReportKpis.totalDealers}
            icon={<StorefrontIcon size={20} />}
            iconColor="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Active Dealers"
            value={dealerReportKpis.activeDealers}
            icon={<StorefrontIcon size={20} />}
            iconColor="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Scans"
            value={dealerReportKpis.totalScans.toLocaleString('en-IN')}
            icon={<ScanLine size={20} />}
            iconColor="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Reward Points"
            value={dealerReportKpis.totalRewardPoints.toLocaleString('en-IN')}
            icon={<Coins size={20} />}
            iconColor="warning"
          />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="dealer-reports-list"
        columns={columns}
        rows={filteredRows}
        getRowId={(row) => row.id}
        searchPlaceholder="Search dealers…"
        searchKeys={(row) => `${row.dealerName} ${row.city} ${row.dealerId}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={filterCount}
        onExportClick={() => {}}
        defaultSortBy="dealerName"
        actions={[
          {
            label: 'View',
            onClick: (row) => navigate(`/reports/dealer-reports/${row.id}`),
          },
        ]}
        emptyTitle="No dealer reports found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<DealerReportFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Dealer Reports"
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
            <TextField
              label="City"
              size="small"
              value={draft.city}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, city: e.target.value }))
              }
            />
            <TextField
              select
              label="City Quick Filter"
              size="small"
              value=""
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, city: e.target.value }))
              }
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Delhi">Delhi</MenuItem>
              <MenuItem value="Mumbai">Mumbai</MenuItem>
              <MenuItem value="Chennai">Chennai</MenuItem>
              <MenuItem value="Kolkata">Kolkata</MenuItem>
              <MenuItem value="Pune">Pune</MenuItem>
              <MenuItem value="Ahmedabad">Ahmedabad</MenuItem>
              <MenuItem value="Jaipur">Jaipur</MenuItem>
              <MenuItem value="Lucknow">Lucknow</MenuItem>
              <MenuItem value="Bengaluru">Bengaluru</MenuItem>
              <MenuItem value="Hyderabad">Hyderabad</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Onboarded From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, fromDate: e.target.value }))
              }
            />
            <TextField
              type="date"
              label="Onboarded To"
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
    </>
  )
}
