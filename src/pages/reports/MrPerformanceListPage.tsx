import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Checkbox, Chip, FormControlLabel, Grid, Stack, TextField, Typography } from '@mui/material'
import {
  ChartColumnBig as ChartColumnBigIcon,
  UserRound as UserRoundIcon,
  Store as StoreIcon,
  Pill as PillIcon,
  Gauge as GaugeIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { mockMrPerformanceReports, mrPerformanceKpis } from '@/features/reports/mockMrPerformanceReports'
import type { MrPerformanceReportRow } from '@/types/mrPerformanceReport'
import type { PartnerStatus, PartnerZone } from '@/types/partner'

interface MrPerformanceFilters extends Record<string, unknown> {
  regions: PartnerZone[]
  statuses: PartnerStatus[]
  dateFrom: string
  dateTo: string
}

const ALL_REGIONS: PartnerZone[] = ['North', 'South', 'East', 'West']
const ALL_STATUSES: PartnerStatus[] = ['active', 'pending', 'inactive']

function performanceColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'error'
}

export function MrPerformanceListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <ChartColumnBigIcon size={20} />,
    title: 'MR Performance',
    subtitle: 'Displays Medical Representative performance across dealer and chemist engagement.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<MrPerformanceFilters>({
    regions: [],
    statuses: [],
    dateFrom: '',
    dateTo: '',
  })

  const filteredReports = mockMrPerformanceReports.filter((report) => {
    const regionMatch = appliedFilters.regions.length === 0 || appliedFilters.regions.includes(report.region)
    const statusMatch = appliedFilters.statuses.length === 0 || appliedFilters.statuses.includes(report.status)
    return regionMatch && statusMatch
  })

  const filterCount =
    appliedFilters.regions.length + appliedFilters.statuses.length + (appliedFilters.dateFrom || appliedFilters.dateTo ? 1 : 0)

  const columns: CommonTableColumn<MrPerformanceReportRow>[] = [
    {
      key: 'mrName',
      header: 'MR Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.mrName,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
            {row.mrName.slice(0, 1)}
          </Avatar>
          <Typography
            sx={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate(`/reports/mr-performance/${row.id}`)}
          >
            {row.mrName}
          </Typography>
        </Stack>
      ),
    },
    { key: 'region', header: 'Region', sortable: true, render: (row) => row.region },
    {
      key: 'dealersOnboarded',
      header: 'Dealers Onboarded',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.dealersOnboarded,
      render: (row) => row.dealersOnboarded,
    },
    {
      key: 'chemistsOnboarded',
      header: 'Chemists Onboarded',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.chemistsOnboarded,
      render: (row) => row.chemistsOnboarded,
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
      key: 'performanceScore',
      header: 'Performance Score',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.performanceScore,
      render: (row) => <Chip label={`${row.performanceScore}`} size="small" color={performanceColor(row.performanceScore)} variant="filled" />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total MRs" value={mrPerformanceKpis.totalMrs} icon={<UserRoundIcon size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Dealers Onboarded" value={mrPerformanceKpis.totalDealersOnboarded} icon={<StoreIcon size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Chemists Onboarded" value={mrPerformanceKpis.totalChemistsOnboarded} icon={<PillIcon size={20} />} iconColor="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Average Performance Score" value={mrPerformanceKpis.averagePerformanceScore} icon={<GaugeIcon size={20} />} iconColor="success" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="mr-performance-list"
        columns={columns}
        rows={filteredReports}
        getRowId={(row) => row.id}
        searchPlaceholder="Search MR performance…"
        searchKeys={(row) => `${row.mrName} ${row.region}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={filterCount}
        onExportClick={() => {}}
        defaultSortBy="mrName"
        actions={[
          { label: 'View Report', onClick: (row) => navigate(`/reports/mr-performance/${row.id}`) },
        ]}
        emptyTitle="No MR performance reports found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<MrPerformanceFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter MR Performance"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Region</Typography>
              {ALL_REGIONS.map((region) => (
                <FormControlLabel
                  key={region}
                  control={
                    <Checkbox
                      checked={draft.regions.includes(region)}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          regions: e.target.checked ? [...prev.regions, region] : prev.regions.filter((r) => r !== region),
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
                          statuses: e.target.checked ? [...prev.statuses, status] : prev.statuses.filter((s) => s !== status),
                        }))
                      }
                    />
                  }
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                />
              ))}
            </Stack>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Date Range</Typography>
              <TextField
                label="From"
                type="date"
                size="small"
                value={draft.dateFrom}
                onChange={(e) => setDraft((prev) => ({ ...prev, dateFrom: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="To"
                type="date"
                size="small"
                value={draft.dateTo}
                onChange={(e) => setDraft((prev) => ({ ...prev, dateTo: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
