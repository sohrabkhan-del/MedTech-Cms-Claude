import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { FileSpreadsheet, FileText, FileDown, Target, Users, Gift, MapPin } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import {
  mockSchemeReports,
  schemeReportKpis,
  schemeReportRegionOptions,
  schemeReportPartnerTypeOptions,
} from '@/features/reportsAnalytics/mockSchemeReports'
import type { SchemeReportEntry } from '@/types/schemeReport'
import type { PartnerZone } from '@/types/partner'
import type { SchemeType, SchemePartnerType } from '@/types/scheme'

interface SchemeReportFilters extends Record<string, unknown> {
  schemeType: SchemeType | 'all'
  region: PartnerZone | 'all'
  partnerType: SchemePartnerType | 'all'
  fromDate: string
  toDate: string
}

export function SchemeReportListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Target size={20} />,
    title: 'Scheme Reports',
    subtitle: 'Insights into scheme enrollment, points allocated, and partner participation across Dealers and Chemists.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<SchemeReportFilters>({
    schemeType: 'all',
    region: 'all',
    partnerType: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredReports = useMemo(
    () =>
      mockSchemeReports.filter((report) => {
        const typeMatch = appliedFilters.schemeType === 'all' || report.schemeType === appliedFilters.schemeType
        const regionMatch = appliedFilters.region === 'all' || report.regions.includes(appliedFilters.region)
        const partnerMatch = appliedFilters.partnerType === 'all' || report.partnerTypes.includes(appliedFilters.partnerType)
        const fromMatch = !appliedFilters.fromDate || report.startDate >= appliedFilters.fromDate
        const toMatch = !appliedFilters.toDate || (report.endDate ?? '9999-12-31') <= appliedFilters.toDate
        return typeMatch && regionMatch && partnerMatch && fromMatch && toMatch
      }),
    [appliedFilters],
  )

  const columns: CommonTableColumn<SchemeReportEntry>[] = [
    {
      key: 'schemeName',
      header: 'Scheme Name',
      minWidth: 220,
      sortable: true,
      sortValue: (row) => row.schemeName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/reports/scheme-reports/${row.id}`)}
        >
          {row.schemeName}
        </Typography>
      ),
    },
    { key: 'schemeType', header: 'Type', minWidth: 110, render: (row) => (row.schemeType === 'general' ? 'General' : 'Seasonal') },
    { key: 'regions', header: 'Regions', minWidth: 150, render: (row) => row.regions.join(', ') },
    { key: 'partnerTypes', header: 'Partner Types', minWidth: 140, render: (row) => row.partnerTypes },
    {
      key: 'dealerTotal',
      header: 'Dealer Points',
      align: 'center',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.dealerTotal,
      render: (row) => row.dealerTotal.toLocaleString('en-IN'),
    },
    {
      key: 'chemistTotal',
      header: 'Chemist Points',
      align: 'center',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.chemistTotal,
      render: (row) => row.chemistTotal.toLocaleString('en-IN'),
    },
    {
      key: 'enrolledPartners',
      header: 'Enrolled Partners',
      align: 'center',
      minWidth: 140,
      sortable: true,
      sortValue: (row) => row.enrolledPartners,
      render: (row) => row.enrolledPartners.toLocaleString('en-IN'),
    },
    { key: 'startDate', header: 'Start Date', minWidth: 120, sortable: true, sortValue: (row) => row.startDate, render: (row) => row.startDate },
    { key: 'endDate', header: 'End Date', minWidth: 120, render: (row) => row.endDate ?? 'No end date' },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Schemes" value={schemeReportKpis.totalSchemes} icon={<Target size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Enrolled Partners" value={schemeReportKpis.totalEnrolledPartners.toLocaleString('en-IN')} icon={<Users size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Dealer Points Allocated" value={schemeReportKpis.totalDealerPoints.toLocaleString('en-IN')} icon={<Gift size={20} />} iconColor="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Chemist Points Allocated" value={schemeReportKpis.totalChemistPoints.toLocaleString('en-IN')} icon={<MapPin size={20} />} iconColor="success" />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <Button variant="outlined" size="small" startIcon={<FileSpreadsheet size={16} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
          Export Excel
        </Button>
        <Button variant="outlined" size="small" startIcon={<FileText size={16} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
          Export CSV
        </Button>
        <Button variant="outlined" size="small" startIcon={<FileDown size={16} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
          Export PDF
        </Button>
      </Stack>

      <CommonTable
        tableKey="scheme-reports-list"
        columns={columns}
        rows={filteredReports}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by scheme name…"
        searchKeys={(row) => `${row.schemeName} ${row.partnerTypes}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.schemeType !== 'all' ? 1 : 0) +
          (appliedFilters.region !== 'all' ? 1 : 0) +
          (appliedFilters.partnerType !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        defaultSortBy="schemeName"
        actions={[{ label: 'View', onClick: (row) => navigate(`/reports/scheme-reports/${row.id}`) }]}
        emptyTitle="No scheme reports found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<SchemeReportFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Scheme Reports"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Scheme Type"
              size="small"
              value={draft.schemeType}
              onChange={(e) => setDraft((prev) => ({ ...prev, schemeType: e.target.value as SchemeReportFilters['schemeType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="seasonal">Seasonal</MenuItem>
            </TextField>
            <TextField
              select
              label="Region"
              size="small"
              value={draft.region}
              onChange={(e) => setDraft((prev) => ({ ...prev, region: e.target.value as SchemeReportFilters['region'] }))}
            >
              <MenuItem value="all">All Regions</MenuItem>
              {schemeReportRegionOptions.map((region) => (
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
              onChange={(e) => setDraft((prev) => ({ ...prev, partnerType: e.target.value as SchemeReportFilters['partnerType'] }))}
            >
              <MenuItem value="all">All Partner Types</MenuItem>
              {schemeReportPartnerTypeOptions.map((type) => (
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
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="End Date To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, toDate: e.target.value }))}
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
