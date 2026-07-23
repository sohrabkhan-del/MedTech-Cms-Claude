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
import { SeverityChip } from '@/features/fieldOperations/components/SeverityChip'
import { SEVERITY_CONFIG } from '@/features/fieldOperations/severityConfig'
import { useSecurityAlerts } from '@/features/fieldOperations/hooks/useSecurityAlerts'
import type { AlertSeverity, SecurityAlert } from '@/features/fieldOperations/types/fieldOperations.types'
import type { ScanUserRole } from '@/types/scanFeed'

interface AlertFilters extends Record<string, unknown> {
  severity: AlertSeverity | 'all'
  userType: ScanUserRole | 'all'
  userStatus: 'active' | 'inactive' | 'all'
}

export function SecurityAlertsPage() {
  const navigate = useNavigate()
  const { alerts, kpis, isLoading } = useSecurityAlerts()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<AlertFilters>({
    severity: 'all',
    userType: 'all',
    userStatus: 'all',
  })

  const securityAlertKpis = kpis ?? { totalAlerts: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 }

  const filteredAlerts = alerts.filter((alert) => {
    const severityMatch = appliedFilters.severity === 'all' || alert.severity === appliedFilters.severity
    const userTypeMatch = appliedFilters.userType === 'all' || alert.userType === appliedFilters.userType
    const statusMatch = appliedFilters.userStatus === 'all' || alert.userStatus === appliedFilters.userStatus
    return severityMatch && userTypeMatch && statusMatch
  })

  const openUser = (userId: string) => {
    navigate(`/field-operations/security-alerts/${userId}`)
  }

  const columns: CommonTableColumn<SecurityAlert>[] = [
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 160,
      sortable: true,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openUser(row.userId)}
        >
          {row.userName}
        </Typography>
      ),
    },
    { key: 'userType', header: 'User Type', render: (row) => row.userType },
    {
      key: 'affectedUserName',
      header: 'Affected User Name',
      minWidth: 160,
      sortable: true,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openUser(row.affectedUserId)}
        >
          {row.affectedUserName}
        </Typography>
      ),
    },
    { key: 'affectedUserType', header: 'Affected User Type', render: (row) => row.affectedUserType },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      sortValue: (row) => SEVERITY_CONFIG[row.severity].label,
      render: (row) => <SeverityChip severity={row.severity} />,
    },
    {
      key: 'alertType',
      header: 'Alert Type',
      minWidth: 170,
      sortable: true,
      render: (row) => row.alertType,
    },
    {
      key: 'alertDateTime',
      header: 'Alert Date & Time',
      minWidth: 160,
      render: (row) => row.alertDateTime,
    },
  ]

  return (
    <>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', mb: 2.5 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'error.light',
            color: 'error.main',
          }}
        >
          <GppMaybeIcon size={20} />
        </Box>
        <Box>
          <Typography variant="h1">Security Alerts</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Real-time monitoring of suspicious activity across the platform.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Security Alerts"
              value={securityAlertKpis.totalAlerts}
              icon={<GppMaybeIcon size={20} />}
              iconColor="primary"
              onClick={() => setAppliedFilters((prev) => ({ ...prev, severity: 'all' }))}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="High Severity Alerts"
              value={securityAlertKpis.highSeverity}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="error"
              onClick={() => setAppliedFilters((prev) => ({ ...prev, severity: 'high' }))}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Medium Severity Alerts"
              value={securityAlertKpis.mediumSeverity}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="warning"
              onClick={() => setAppliedFilters((prev) => ({ ...prev, severity: 'medium' }))}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Low Severity Alerts"
              value={securityAlertKpis.lowSeverity}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="info"
              onClick={() => setAppliedFilters((prev) => ({ ...prev, severity: 'low' }))}
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="security-alerts-list"
        columns={columns}
        rows={filteredAlerts}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search alerts…"
        searchKeys={(row) =>
          `${row.userName} ${row.affectedUserName} ${row.alertType} ${row.id}`
        }
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.severity !== 'all' ? 1 : 0) +
          (appliedFilters.userType !== 'all' ? 1 : 0) +
          (appliedFilters.userStatus !== 'all' ? 1 : 0)
        }
        defaultSortBy="alertDateTime"
        actions={[
          {
            label: 'View suspicious user',
            onClick: (row) => openUser(row.userId),
          },
          {
            label: 'View original user',
            onClick: (row) => openUser(row.affectedUserId),
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
        onApply={setAppliedFilters}
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
              label="User Type"
              size="small"
              value={draft.userType}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  userType: e.target.value as AlertFilters['userType'],
                }))
              }
            >
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
            <TextField
              select
              label="User Status"
              size="small"
              value={draft.userStatus}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  userStatus: e.target.value as AlertFilters['userStatus'],
                }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
