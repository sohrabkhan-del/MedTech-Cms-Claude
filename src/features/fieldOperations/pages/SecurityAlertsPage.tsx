import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  ShieldAlert as GppMaybeIcon,
  TriangleAlert as ReportProblemOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { SeverityChip } from '@/features/fieldOperations/components/SeverityChip'
import { SEVERITY_CONFIG } from '@/features/fieldOperations/severityConfig'
import { useSecurityAlerts } from '@/features/fieldOperations/hooks/useSecurityAlerts'
import type {
  AlertSeverity,
  AlertStatus,
  SecurityAlert,
} from '@/features/fieldOperations/types/fieldOperations.types'

interface AlertFilters extends Record<string, unknown> {
  severity: AlertSeverity | 'all'
  status: AlertStatus | 'all'
  type: string
}

const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  severity: 'severity',
  status: 'status',
  type: 'type',
  createdAt: 'createdAt',
}

export function SecurityAlertsPage() {
  const navigate = useNavigate()
  const { regionId: topbarRegionId } = useRegionFilter()
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<AlertFilters>({
    severity: 'all',
    status: 'all',
    type: '',
  })
  const [sortColumn, setSortColumn] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const debouncedSearch = useDebouncedValue(search, 300)

  const { alerts, totalItems, kpis, isLoading } = useSecurityAlerts({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    severity: appliedFilters.severity !== 'all' ? appliedFilters.severity.toUpperCase() : undefined,
    status: appliedFilters.status !== 'all' ? appliedFilters.status.toUpperCase() : undefined,
    type: appliedFilters.type || undefined,
    regionId: topbarRegionId || undefined,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
  })
  useRegionTopbarHeader({
    icon: <GppMaybeIcon size={20} />,
    title: 'Security Alerts',
    subtitle: 'Real-time monitoring of suspicious activity across the platform.',
    isLoading,
  })

  const securityAlertKpis = kpis ?? {
    totalAlerts: 0,
    totalAlertsChange: 0,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    criticalSeverity: 0,
  }

  const openPartner = (partnerId: string) => {
    navigate(`/field-operations/security-alerts/${partnerId}`)
  }

  const columns: CommonTableColumn<SecurityAlert>[] = [
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.scanPartnerDetails.businessName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openPartner(row.scanPartnerDetails.id)}
        >
          {row.scanPartnerDetails.businessName}
        </Typography>
      ),
    },
    {
      key: 'userType',
      header: 'User Type',
      render: (row) => row.scanPartnerDetails.type,
    },
    {
      key: 'affectedUserName',
      header: 'Affected User Name',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.affectedPartnerDetails.businessName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openPartner(row.affectedPartnerDetails.id)}
        >
          {row.affectedPartnerDetails.businessName}
        </Typography>
      ),
    },
    {
      key: 'affectedUserType',
      header: 'Affected User Type',
      render: (row) => row.affectedPartnerDetails.type,
    },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      sortValue: (row) => row.scanPartnerDetails.region,
      render: (row) => (
        <Chip size="small" label={row.scanPartnerDetails.region} variant="outlined" />
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      sortValue: (row) => SEVERITY_CONFIG[row.severity].label,
      render: (row) => <SeverityChip severity={row.severity} />,
    },
    {
      key: 'type',
      header: 'Alert Type',
      minWidth: 170,
      sortable: true,
      render: (row) => row.type,
    },
    {
      key: 'createdAt',
      header: 'Alert Date & Time',
      minWidth: 160,
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Security Alerts"
              value={securityAlertKpis.totalAlerts}
              icon={<GppMaybeIcon size={20} />}
              iconColor="primary"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, severity: 'all' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="High Severity Alerts"
              value={securityAlertKpis.highSeverity}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="error"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, severity: 'high' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Medium Severity Alerts"
              value={securityAlertKpis.mediumSeverity}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="warning"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, severity: 'medium' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Low Severity Alerts"
              value={securityAlertKpis.lowSeverity}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="info"
              onClick={() => {
                setAppliedFilters((prev) => ({ ...prev, severity: 'low' }))
                setPage(0)
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Critical Severity Alerts"
              value={securityAlertKpis.criticalSeverity}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="error"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        key={`${appliedFilters.severity}-${appliedFilters.status}-${appliedFilters.type}`}
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
        tableKey="security-alerts-list"
        columns={columns}
        rows={alerts}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search alerts…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.severity !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.type.trim() ? 1 : 0)
        }
        defaultSortBy="createdAt"
        defaultSortDir="desc"
        actions={[
          {
            label: 'View suspicious user',
            onClick: (row) => openPartner(row.scanPartnerDetails.id),
          },
          {
            label: 'View original user',
            onClick: (row) => openPartner(row.affectedPartnerDetails.id),
          },
        ]}
        emptyTitle="No security alerts found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<AlertFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Alerts"
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
              label="Severity"
              size="small"
              value={draft.severity}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  severity: e.target.value as AlertFilters['severity'],
                }))
              }
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as AlertFilters['status'],
                }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="reviewing">Reviewing</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="dismissed">Dismissed</MenuItem>
            </TextField>
            <TextField
              label="Incident Type"
              size="small"
              placeholder="e.g. QR_ALREADY_CLAIMED"
              value={draft.type}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
