import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { FileSpreadsheet, FileText, FileDown, Target, Users, Trophy, Gauge } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import {
  mockSchemeReports,
  schemeReportKpis,
  schemeReportTypeOptions,
  schemeReportApplicableUserOptions,
} from '@/features/reportsAnalytics/mockSchemeReports'
import type { SchemeReportEntry } from '@/types/schemeReport'
import type { ApplicableUserType, SchemeCategory, SchemeStatus, SchemeType } from '@/types/scheme'

const statusConfig: Record<SchemeStatus, { label: string; color: 'success' | 'default' | 'error' | 'info' | 'warning' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  expired: { label: 'Expired', color: 'error' },
  upcoming: { label: 'Upcoming', color: 'info' },
  draft: { label: 'Draft', color: 'warning' },
}

interface SchemeReportFilters extends Record<string, unknown> {
  schemeType: SchemeType | 'all'
  schemeCategory: SchemeCategory | 'all'
  applicableTo: ApplicableUserType | 'all'
  status: SchemeStatus | 'all'
  fromDate: string
  toDate: string
}

export function SchemeReportListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Target size={20} />,
    title: 'Scheme Reports',
    subtitle:
      'Insights into the performance and effectiveness of reward schemes, including participant engagement, reward distribution, target achievements, and scheme completion across Dealers, Chemists, and MRs.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<SchemeReportFilters>({
    schemeType: 'all',
    schemeCategory: 'all',
    applicableTo: 'all',
    status: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredReports = useMemo(
    () =>
      mockSchemeReports.filter((report) => {
        const typeMatch = appliedFilters.schemeType === 'all' || report.scheme.schemeType === appliedFilters.schemeType
        const categoryMatch = appliedFilters.schemeCategory === 'all' || report.schemeCategory === appliedFilters.schemeCategory
        const applicableMatch =
          appliedFilters.applicableTo === 'all' || report.scheme.applicableUsers.includes(appliedFilters.applicableTo)
        const statusMatch = appliedFilters.status === 'all' || report.status === appliedFilters.status
        const fromMatch = !appliedFilters.fromDate || report.startDate >= appliedFilters.fromDate
        const toMatch = !appliedFilters.toDate || (report.endDate ?? '9999') <= appliedFilters.toDate || !appliedFilters.toDate
        return typeMatch && categoryMatch && applicableMatch && statusMatch && fromMatch && toMatch
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
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/reports/scheme-reports/${row.id}`)}
        >
          {row.schemeName}
        </Typography>
      ),
    },
    {
      key: 'schemeCategory',
      header: 'Scheme Type',
      minWidth: 120,
      render: (row) => (row.schemeCategory === 'general' ? 'General' : 'Seasonal'),
    },
    {
      key: 'applicableTo',
      header: 'Applicable To',
      minWidth: 160,
      render: (row) => row.applicableTo,
    },
    {
      key: 'totalParticipants',
      header: 'Total Participants',
      align: 'right',
      minWidth: 140,
      sortable: true,
      sortValue: (row) => row.totalParticipants,
      render: (row) => row.totalParticipants.toLocaleString('en-IN'),
    },
    {
      key: 'rewardPointsIssued',
      header: 'Reward Points Issued',
      align: 'right',
      minWidth: 150,
      sortable: true,
      sortValue: (row) => row.rewardPointsIssued,
      render: (row) => row.rewardPointsIssued.toLocaleString('en-IN'),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.startDate,
      render: (row) => row.startDate,
    },
    {
      key: 'endDate',
      header: 'End Date',
      minWidth: 120,
      render: (row) => row.endDate ?? 'Ongoing',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <Chip size="small" label={statusConfig[row.status].label} color={statusConfig[row.status].color} />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Schemes" value={schemeReportKpis.totalSchemes} icon={<Target size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Active Schemes" value={schemeReportKpis.activeSchemes} icon={<Gauge size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Participants" value={schemeReportKpis.totalParticipants.toLocaleString('en-IN')} icon={<Users size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Reward Points Issued" value={schemeReportKpis.rewardPointsIssued.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />
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
        searchKeys={(row) => `${row.schemeName} ${row.applicableTo}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.schemeType !== 'all' ? 1 : 0) +
          (appliedFilters.schemeCategory !== 'all' ? 1 : 0) +
          (appliedFilters.applicableTo !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0) +
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
              {schemeReportTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Scheme Category"
              size="small"
              value={draft.schemeCategory}
              onChange={(e) => setDraft((prev) => ({ ...prev, schemeCategory: e.target.value as SchemeReportFilters['schemeCategory'] }))}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="seasonal">Seasonal</MenuItem>
            </TextField>
            <TextField
              select
              label="Applicable To"
              size="small"
              value={draft.applicableTo}
              onChange={(e) => setDraft((prev) => ({ ...prev, applicableTo: e.target.value as SchemeReportFilters['applicableTo'] }))}
            >
              <MenuItem value="all">All Users</MenuItem>
              {schemeReportApplicableUserOptions.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as SchemeReportFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
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
