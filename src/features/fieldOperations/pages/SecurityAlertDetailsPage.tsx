import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Stack, Typography, Button } from '@mui/material'
import {
  ShieldAlert as GppMaybeIcon,
  TriangleAlert as ReportProblemOutlined,
  Activity as TimelineIcon,
  ArrowLeft as ArrowBackOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { CommonTable } from '@/components/common/CommonTable/CommonTable'
import { SeverityChip } from '@/features/fieldOperations/components/SeverityChip'
import { SEVERITY_CONFIG } from '@/features/fieldOperations/severityConfig'
import { useSecurityAlertUserProfile } from '@/features/fieldOperations/hooks/useSecurityAlertUserProfile'

export function SecurityAlertDetailsPage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const { summary: userSummary, alertHistory: userAlertHistory, timeline: userTimeline, isLoading } = useSecurityAlertUserProfile(userId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!userSummary) {
    return (
      <EmptyState
        title="User not found"
        description="This user's security profile may have been removed."
        actionLabel="Back to Security Alerts"
        onAction={() => navigate('/field-operations/security-alerts')}
      />
    )
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
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
            <GppMaybeIcon size={18} />
          </Box>
          <Box>
            <Typography variant="h1">{userSummary.userName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {userSummary.userId} · {userSummary.userType}
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined size={18} />}
          onClick={() => navigate('/field-operations/security-alerts')}
          sx={{ fontSize: '0.8125rem' }}
        >
          Back
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="User Summary">
          <DetailFieldGrid
            fields={[
              { label: 'User ID', value: userSummary.userId },
              { label: 'User Name', value: userSummary.userName },
              { label: 'User Type', value: userSummary.userType },
              { label: 'Mobile Number', value: userSummary.mobileNumber },
              { label: 'Email Address', value: userSummary.email },
              { label: 'Region', value: userSummary.region },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="Total Security Alerts"
              value={userSummary.totalAlerts}
              icon={<GppMaybeIcon size={20} />}
              iconColor="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="High Severity Alerts"
              value={userSummary.highSeverityAlerts}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="error"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="Last Alert Date"
              value={userSummary.lastAlertDate}
              icon={<TimelineIcon size={20} />}
              iconColor="warning"
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
            loading={isLoading}
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
    </>
  )
}
