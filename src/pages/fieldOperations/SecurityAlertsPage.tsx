import { useMemo, useState } from 'react'
import { Box, Button, Grid, MenuItem, Stack, TextField, Typography, Chip } from '@mui/material'
import { ShieldAlert as GppMaybeIcon, TriangleAlert as ReportProblemOutlined, CircleCheck as CheckCircleOutlined, Ban as BlockOutlined, Activity as TimelineIcon } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import {
  mockSecurityAlerts,
  securityAlertKpis,
  getUserSecuritySummary,
  getUserAlertHistory,
  getUserSecurityTimeline,
} from '@/features/fieldOperations/mockSecurityAlerts'
import type { AlertSeverity, SecurityAlert } from '@/types/securityAlert'
import type { ScanUserRole } from '@/types/scanFeed'

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; color: 'error' | 'warning' | 'info' }
> = {
  high: { label: 'High', color: 'error' },
  medium: { label: 'Medium', color: 'warning' },
  low: { label: 'Low', color: 'info' },
}

function SeverityChip({ severity }: { severity: AlertSeverity }) {
  const config = SEVERITY_CONFIG[severity]
  return (
    <Chip
      label={config.label}
      size="small"
      color={config.color}
      variant="filled"
    />
  )
}

function StatusChip({ status }: { status: 'active' | 'inactive' }) {
  return (
    <Chip
      label={status === 'active' ? 'Active' : 'Inactive'}
      size="small"
      color={status === 'active' ? 'success' : 'error'}
      variant="filled"
    />
  )
}

interface AlertFilters extends Record<string, unknown> {
  severity: AlertSeverity | 'all'
  userType: ScanUserRole | 'all'
  userStatus: 'active' | 'inactive' | 'all'
}

export function SecurityAlertsPage() {
  const [tab, setTab] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<AlertFilters>({
    severity: 'all',
    userType: 'all',
    userStatus: 'all',
  })
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, 'active' | 'inactive'>
  >({})

  const resolveStatus = (alert: SecurityAlert) =>
    statusOverrides[alert.affectedUserId] ?? alert.userStatus

  const filteredAlerts = useMemo(
    () =>
      mockSecurityAlerts.filter((alert) => {
        const status = statusOverrides[alert.affectedUserId] ?? alert.userStatus
        const severityMatch =
          appliedFilters.severity === 'all' ||
          alert.severity === appliedFilters.severity
        const userTypeMatch =
          appliedFilters.userType === 'all' ||
          alert.userType === appliedFilters.userType
        const statusMatch =
          appliedFilters.userStatus === 'all' ||
          status === appliedFilters.userStatus
        return severityMatch && userTypeMatch && statusMatch
      }),
    [appliedFilters, statusOverrides],
  )

  const openUser = (userId: string) => {
    setSelectedUserId(userId)
    setTab(1)
  }

  const setUserStatus = (userId: string, status: 'active' | 'inactive') => {
    setStatusOverrides((prev) => ({ ...prev, [userId]: status }))
  }

  const columns: CommonTableColumn<SecurityAlert>[] = [
    { key: 'id', header: 'Alert ID', render: (row) => row.id },
    {
      key: 'alertType',
      header: 'Alert Type',
      minWidth: 170,
      sortable: true,
      render: (row) => row.alertType,
    },
    {
      key: 'description',
      header: 'Description',
      minWidth: 200,
      render: (row) => (
        <Typography
          noWrap
          sx={{
            fontSize: '0.8125rem',
            maxWidth: 260,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={row.description}
        >
          {row.description}
        </Typography>
      ),
    },
    {
      key: 'affectedUserName',
      header: 'Affected User',
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
    { key: 'userType', header: 'User Type', render: (row) => row.userType },
    {
      key: 'requestSource',
      header: 'Request Source',
      render: (row) => row.requestSource,
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      sortValue: (row) => SEVERITY_CONFIG[row.severity].label,
      render: (row) => <SeverityChip severity={row.severity} />,
    },
    {
      key: 'alertDateTime',
      header: 'Alert Date & Time',
      minWidth: 160,
      render: (row) => row.alertDateTime,
    },
    {
      key: 'userStatus',
      header: 'User Status',
      render: (row) => <StatusChip status={resolveStatus(row)} />,
    },
  ]

  const userSummary = selectedUserId
    ? getUserSecuritySummary(selectedUserId)
    : undefined
  const userAlertHistory = selectedUserId
    ? getUserAlertHistory(selectedUserId)
    : []
  const userTimeline = selectedUserId
    ? getUserSecurityTimeline(selectedUserId)
    : []
  const currentUserStatus = selectedUserId
    ? (statusOverrides[selectedUserId] ?? userSummary?.status)
    : undefined

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

      {tab === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Total Security Alerts"
                value={securityAlertKpis.totalAlerts}
                icon={<GppMaybeIcon size={20} />}
                iconColor="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="High Severity Alerts"
                value={securityAlertKpis.highSeverity}
                icon={<ReportProblemOutlined size={20} />}
                iconColor="error"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Medium Severity Alerts"
                value={securityAlertKpis.mediumSeverity}
                icon={<ReportProblemOutlined size={20} />}
                iconColor="warning"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Low Severity Alerts"
                value={securityAlertKpis.lowSeverity}
                icon={<ReportProblemOutlined size={20} />}
                iconColor="info"
              />
            </Grid>
          </Grid>

          <CommonTable
            tableKey="security-alerts-list"
            columns={columns}
            rows={filteredAlerts}
            getRowId={(row) => row.id}
            searchPlaceholder="Search alerts…"
            searchKeys={(row) =>
              `${row.affectedUserName} ${row.alertType} ${row.id}`
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
                label: 'View Details',
                onClick: (row) => openUser(row.affectedUserId),
              },
              {
                label: 'Activate User',
                onClick: (row) => setUserStatus(row.affectedUserId, 'active'),
              },
              {
                label: 'Deactivate User',
                onClick: (row) => setUserStatus(row.affectedUserId, 'inactive'),
                danger: true,
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
      )}

      {tab === 1 &&
        (userSummary ? (
          <Stack spacing={3}>
            <SectionCard
              title="User Summary"
              action={
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    startIcon={<CheckCircleOutlined size={20} />}
                    disabled={currentUserStatus === 'active'}
                    onClick={() => setUserStatus(userSummary.userId, 'active')}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Activate User
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<BlockOutlined size={20} />}
                    disabled={currentUserStatus === 'inactive'}
                    onClick={() => setUserStatus(userSummary.userId, 'inactive')}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Deactivate User
                  </Button>
                </Stack>
              }
            >
              <DetailFieldGrid
                fields={[
                  { label: 'User ID', value: userSummary.userId },
                  { label: 'User Name', value: userSummary.userName },
                  { label: 'User Type', value: userSummary.userType },
                  { label: 'Mobile Number', value: userSummary.mobileNumber },
                  { label: 'Email Address', value: userSummary.email },
                  { label: 'Region', value: userSummary.region },
                  { label: 'Current Status', value: <StatusChip status={currentUserStatus ?? userSummary.status} /> },
                ]}
              />
            </SectionCard>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Total Security Alerts"
                  value={userSummary.totalAlerts}
                  icon={<GppMaybeIcon size={20} />}
                  iconColor="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="High Severity Alerts"
                  value={userSummary.highSeverityAlerts}
                  icon={<ReportProblemOutlined size={20} />}
                  iconColor="error"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Last Alert Date"
                  value={userSummary.lastAlertDate}
                  icon={<TimelineIcon size={20} />}
                  iconColor="warning"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Current Account Status"
                  value={currentUserStatus === 'active' ? 'Active' : 'Inactive'}
                  icon={currentUserStatus === 'active' ? <CheckCircleOutlined size={20} /> : <BlockOutlined size={20} />}
                  iconColor={currentUserStatus === 'active' ? 'success' : 'error'}
                />
              </Grid>
            </Grid>

            <SectionCard title="User Information">
              <DetailFieldGrid
                fields={[
                  { label: 'Last Known Location', value: userSummary.lastKnownLocation },
                  { label: 'Source IP Address', value: userSummary.sourceIp },
                  { label: 'Device Information', value: userSummary.deviceInfo },
                  { label: 'Registered Device', value: userSummary.registeredDevice },
                  { label: 'Region', value: userSummary.region },
                ]}
              />
            </SectionCard>

            <SectionCard title="Security Alert History">
              <CommonTable
                tableKey="security-alert-user-history"
                columns={[
                  { key: 'alertType', header: 'Alert Type', render: (row) => row.alertType },
                  { key: 'description', header: 'Description', render: (row) => row.description },
                  {
                    key: 'severity',
                    header: 'Severity',
                    sortable: true,
                    sortValue: (row) => SEVERITY_CONFIG[row.severity].label,
                    render: (row) => <SeverityChip severity={row.severity} />,
                  },
                  { key: 'requestSource', header: 'Request Source', render: (row) => row.requestSource },
                  { key: 'sourceIp', header: 'Source IP Address', render: (row) => row.sourceIp },
                  { key: 'alertDateTime', header: 'Alert Date & Time', sortable: true, render: (row) => row.alertDateTime },
                ]}
                rows={userAlertHistory}
                getRowId={(row) => row.id}
                searchPlaceholder="Search alerts…"
                searchKeys={(row) => `${row.alertType} ${row.description}`}
                defaultSortBy="alertDateTime"
                emptyTitle="No alerts recorded"
              />
            </SectionCard>

            <SectionCard title="Security Timeline">
              <ActivityTimeline entries={userTimeline} emptyTitle="No timeline activity yet" />
            </SectionCard>
          </Stack>
        ) : (
          <EmptyState
            title="No user selected"
            description="Select an affected user from the Alert Listing to view their security details."
          />
        ))}
    </>
  )
}
