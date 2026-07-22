import { useState } from 'react'
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  ShieldAlert as GppMaybeIcon,
  TriangleAlert as ReportProblemOutlined,
  CircleCheck as CheckCircleOutlined,
  Ban as BlockOutlined,
  Activity as TimelineIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { SeverityChip } from '@/features/fieldOperations/components/SeverityChip'
import { SEVERITY_CONFIG } from '@/features/fieldOperations/severityConfig'
import { UserStatusChip } from '@/features/fieldOperations/components/UserStatusChip'
import { useSecurityAlerts } from '@/features/fieldOperations/hooks/useSecurityAlerts'
import { useSecurityAlertUserProfile } from '@/features/fieldOperations/hooks/useSecurityAlertUserProfile'
import type { AlertSeverity, SecurityAlert } from '@/features/fieldOperations/types/fieldOperations.types'
import type { ScanUserRole } from '@/types/scanFeed'

interface AlertFilters extends Record<string, unknown> {
  severity: AlertSeverity | 'all'
  userType: ScanUserRole | 'all'
  userStatus: 'active' | 'inactive' | 'all'
}

export function SecurityAlertsPage() {
  const { alerts, kpis, isLoading } = useSecurityAlerts()
  const [tab, setTab] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<AlertFilters>({
    severity: 'all',
    userType: 'all',
    userStatus: 'all',
  })

  const {
    summary: userSummary,
    alertHistory: userAlertHistory,
    timeline: userTimeline,
    currentStatus,
    setStatus,
    isLoading: userAlertHistoryLoading,
  } = useSecurityAlertUserProfile(selectedUserId ?? undefined)

  const securityAlertKpis = kpis ?? { totalAlerts: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 }

  const filteredAlerts = alerts.filter((alert) => {
    const severityMatch = appliedFilters.severity === 'all' || alert.severity === appliedFilters.severity
    const userTypeMatch = appliedFilters.userType === 'all' || alert.userType === appliedFilters.userType
    const statusMatch = appliedFilters.userStatus === 'all' || alert.userStatus === appliedFilters.userStatus
    return severityMatch && userTypeMatch && statusMatch
  })

  const openUser = (userId: string) => {
    setSelectedUserId(userId)
    setTab(1)
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

      {tab === 0 && (
        <>
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
                label: 'View User',
                onClick: (row) => openUser(row.userId),
              },
              {
                label: 'View Affected User',
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
                    disabled={currentStatus === 'active'}
                    onClick={() => setStatus('active')}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Activate User
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<BlockOutlined size={20} />}
                    disabled={currentStatus === 'inactive'}
                    onClick={() => setStatus('inactive')}
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
                  {
                    label: 'Current Status',
                    value: <UserStatusChip status={currentStatus ?? userSummary.status} />,
                  },
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
                  value={currentStatus === 'active' ? 'Active' : 'Inactive'}
                  icon={
                    currentStatus === 'active' ? (
                      <CheckCircleOutlined size={20} />
                    ) : (
                      <BlockOutlined size={20} />
                    )
                  }
                  iconColor={currentStatus === 'active' ? 'success' : 'error'}
                />
              </Grid>
            </Grid>

            <SectionCard title="User Information">
              <DetailFieldGrid
                fields={[
                  {
                    label: 'Last Known Location',
                    value: userSummary.lastKnownLocation,
                  },
                  { label: 'Source IP Address', value: userSummary.sourceIp },
                  {
                    label: 'Device Information',
                    value: userSummary.deviceInfo,
                  },
                  {
                    label: 'Registered Device',
                    value: userSummary.registeredDevice,
                  },
                  { label: 'Region', value: userSummary.region },
                ]}
              />
            </SectionCard>

            <SectionCard title="Security Alert History">
              <CommonTable
                tableKey="security-alert-user-history"
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
                    sortable: true,
                    sortValue: (row) => SEVERITY_CONFIG[row.severity].label,
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
                    sortable: true,
                    render: (row) => row.alertDateTime,
                  },
                ]}
                rows={userAlertHistory}
                loading={userAlertHistoryLoading}
                getRowId={(row) => row.id}
                searchPlaceholder="Search alerts…"
                searchKeys={(row) => `${row.alertType} ${row.description}`}
                defaultSortBy="alertDateTime"
                emptyTitle="No alerts recorded"
              />
            </SectionCard>

            <SectionCard title="Security Timeline">
              <ActivityTimeline
                entries={userTimeline}
                emptyTitle="No timeline activity yet"
              />
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
