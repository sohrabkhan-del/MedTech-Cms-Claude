import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import GppMaybeIcon from '@mui/icons-material/GppMaybe'
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import BlockOutlined from '@mui/icons-material/BlockOutlined'
import TimelineIcon from '@mui/icons-material/Timeline'
import { StatCard } from '@/components/common/StatCard/StatCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { SimpleTable } from '@/components/common/SimpleTable/SimpleTable'
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
          <GppMaybeIcon fontSize="small" />
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
                icon={<GppMaybeIcon fontSize="small" />}
                iconColor="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="High Severity Alerts"
                value={securityAlertKpis.highSeverity}
                icon={<ReportProblemOutlined fontSize="small" />}
                iconColor="error"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Medium Severity Alerts"
                value={securityAlertKpis.mediumSeverity}
                icon={<ReportProblemOutlined fontSize="small" />}
                iconColor="warning"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Low Severity Alerts"
                value={securityAlertKpis.lowSeverity}
                icon={<ReportProblemOutlined fontSize="small" />}
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
            <Card sx={{ p: 3 }}>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'primary.main',
                  }}
                >
                  User Summary
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    startIcon={<CheckCircleOutlined fontSize="small" />}
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
                    startIcon={<BlockOutlined fontSize="small" />}
                    disabled={currentUserStatus === 'inactive'}
                    onClick={() =>
                      setUserStatus(userSummary.userId, 'inactive')
                    }
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Deactivate User
                  </Button>
                </Stack>
              </Stack>
              <Grid container spacing={2.5}>
                {[
                  ['User ID', userSummary.userId],
                  ['User Name', userSummary.userName],
                  ['User Type', userSummary.userType],
                  ['Mobile Number', userSummary.mobileNumber],
                  ['Email Address', userSummary.email],
                  ['Region', userSummary.region],
                ].map(([label, value]) => (
                  <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}
                    >
                      {value}
                    </Typography>
                  </Grid>
                ))}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Current Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip
                      status={currentUserStatus ?? userSummary.status}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Card>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Total Security Alerts"
                  value={userSummary.totalAlerts}
                  icon={<GppMaybeIcon fontSize="small" />}
                  iconColor="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="High Severity Alerts"
                  value={userSummary.highSeverityAlerts}
                  icon={<ReportProblemOutlined fontSize="small" />}
                  iconColor="error"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Last Alert Date"
                  value={userSummary.lastAlertDate}
                  icon={<TimelineIcon fontSize="small" />}
                  iconColor="warning"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Current Account Status"
                  value={currentUserStatus === 'active' ? 'Active' : 'Inactive'}
                  icon={
                    currentUserStatus === 'active' ? (
                      <CheckCircleOutlined fontSize="small" />
                    ) : (
                      <BlockOutlined fontSize="small" />
                    )
                  }
                  iconColor={
                    currentUserStatus === 'active' ? 'success' : 'error'
                  }
                />
              </Grid>
            </Grid>

            <Card sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                User Information
              </Typography>
              <Grid container spacing={2.5}>
                {[
                  ['Last Known Location', userSummary.lastKnownLocation],
                  ['Source IP Address', userSummary.sourceIp],
                  ['Device Information', userSummary.deviceInfo],
                  ['Registered Device', userSummary.registeredDevice],
                  ['Region', userSummary.region],
                ].map(([label, value]) => (
                  <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}
                    >
                      {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                Security Alert History
              </Typography>
              <SimpleTable
                columns={[
                  {
                    key: 'alertType',
                    header: 'Alert Type',
                    render: (row) => row.alertType,
                  },
                  {
                    key: 'description',
                    header: 'Description',
                    render: (row) => row.description,
                  },
                  {
                    key: 'severity',
                    header: 'Severity',
                    render: (row) => <SeverityChip severity={row.severity} />,
                  },
                  {
                    key: 'requestSource',
                    header: 'Request Source',
                    render: (row) => row.requestSource,
                  },
                  {
                    key: 'sourceIp',
                    header: 'Source IP Address',
                    render: (row) => row.sourceIp,
                  },
                  {
                    key: 'alertDateTime',
                    header: 'Alert Date & Time',
                    render: (row) => row.alertDateTime,
                  },
                ]}
                rows={userAlertHistory}
                getRowId={(row) => row.id}
                emptyTitle="No alerts recorded"
              />
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                Security Timeline
              </Typography>
              <Stack spacing={0}>
                {userTimeline.map((entry, index) => (
                  <Stack
                    key={entry.id}
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <Stack sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          mt: 0.75,
                        }}
                      />
                      {index < userTimeline.length - 1 && (
                        <Box
                          sx={{
                            width: '1px',
                            flexGrow: 1,
                            minHeight: 24,
                            backgroundColor: 'divider',
                          }}
                        />
                      )}
                    </Stack>
                    <Box sx={{ pb: 2.5 }}>
                      <Typography
                        sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
                      >
                        {entry.activity}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {entry.dateTime}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Card>
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
