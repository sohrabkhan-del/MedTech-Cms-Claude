import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import {
  Target,
  ArrowLeft as ArrowBackOutlined,
  Users,
  ScanLine,
  Trophy,
  Gauge,
  CircleCheck,
  Ban,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { StatCard } from '@/components/common/StatCard/StatCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useSchemeReportDetail } from '@/features/reportsAnalytics/hooks/useSchemeReportDetail'
import type { SchemeEligibleProduct, SchemeStatus } from '@/types/scheme'

const statusConfig: Record<
  SchemeStatus,
  { label: string; color: 'success' | 'default' | 'error' | 'info' | 'warning' }
> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  expired: { label: 'Expired', color: 'error' },
  upcoming: { label: 'Upcoming', color: 'info' },
  draft: { label: 'Draft', color: 'warning' },
}

const eligibleProductColumns: CommonTableColumn<SchemeEligibleProduct>[] = [
  {
    key: 'productCode',
    header: 'Product Code',
    minWidth: 130,
    render: (row) => row.productCode,
  },
  {
    key: 'productName',
    header: 'Product Name',
    minWidth: 190,
    sortable: true,
    sortValue: (row) => row.productName,
    render: (row) => row.productName,
  },
  {
    key: 'productCategory',
    header: 'Product Category',
    minWidth: 150,
    render: (row) => row.productCategory,
  },
  {
    key: 'productBrand',
    header: 'Product Brand',
    minWidth: 150,
    render: (row) => row.productBrand,
  },
  {
    key: 'bonusPoints',
    header: 'Bonus Points',
    align: 'center',
    sortable: true,
    sortValue: (row) => row.bonusPoints,
    render: (row) => row.bonusPoints,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Chip
        size="small"
        label={row.status === 'active' ? 'Active' : 'Inactive'}
        color={row.status === 'active' ? 'success' : 'default'}
      />
    ),
  },
]

export function SchemeReportDetailsPage() {
  const navigate = useNavigate()
  const { schemeReportId } = useParams<{ schemeReportId: string }>()
  const { report, isLoading } = useSchemeReportDetail(schemeReportId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!report) {
    return (
      <EmptyState
        title="Scheme report not found"
        description="This scheme report may have been removed."
        actionLabel="Back to Scheme Reports"
        onAction={() => navigate('/reports/scheme-reports')}
      />
    )
  }

  const { scheme } = report
  const avgRewardPerParticipant =
    scheme.totalParticipants > 0
      ? Math.round(scheme.rewardPointsIssued / scheme.totalParticipants)
      : 0

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <Target size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{report.schemeName}</Typography>
              <Chip
                size="small"
                label={statusConfig[report.status].label}
                color={statusConfig[report.status].color}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {scheme.id} ·{' '}
              {report.schemeCategory === 'general'
                ? 'General Scheme'
                : 'Seasonal Scheme'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlined size={20} />}
            onClick={() => navigate('/reports/scheme-reports')}
            sx={{ fontSize: '0.75rem' }}
          >
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Scheme Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Scheme ID', value: scheme.id },
              { label: 'Scheme Name', value: report.schemeName },
              {
                label: 'Scheme Category',
                value:
                  report.schemeCategory === 'general' ? 'General' : 'Seasonal',
              },
              { label: 'Scheme Type', value: scheme.schemeType },
              { label: 'Applicable To', value: report.applicableTo },
              { label: 'Start Date', value: report.startDate },
              { label: 'End Date', value: report.endDate ?? 'Ongoing' },
              {
                label: 'Status',
                value: (
                  <Chip
                    size="small"
                    label={statusConfig[report.status].label}
                    color={statusConfig[report.status].color}
                  />
                ),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Reward Configuration">
          <DetailFieldGrid
            fields={[
              { label: 'Reward Type', value: scheme.rewardType },
              { label: 'Bonus Points', value: scheme.bonusPoints },
              { label: 'Multiplier', value: `${scheme.multiplier}x` },
              { label: 'Target Quantity', value: scheme.targetQuantity },
              {
                label: 'Maximum Reward',
                value: scheme.maximumReward.toLocaleString('en-IN'),
              },
              { label: 'Reward Frequency', value: scheme.rewardFrequency },
              { label: 'Stackable', value: scheme.stackable ? 'Yes' : 'No' },
              { label: 'Scan Target', value: scheme.scanTarget },
            ]}
          />
        </SectionCard>

        <SectionCard title="Eligible Products">
          <CommonTable
            tableKey="scheme-report-eligible-products"
            columns={eligibleProductColumns}
            rows={scheme.eligibleProducts}
            getRowId={(row) => row.id}
            searchPlaceholder="Search eligible products…"
            searchKeys={(row) =>
              `${row.productCode} ${row.productName} ${row.productBrand}`
            }
            emptyTitle="No eligible products yet"
          />
        </SectionCard>

        <SectionCard title="Eligible Users">
          <Grid container spacing={2}>
            {(['Dealer', 'Chemist'] as const).map((userType) => (
              <Grid key={userType} size={{ xs: 12, sm: 6 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {scheme.applicableUsers.includes(userType) ? (
                    <CircleCheck
                      size={20}
                      color="var(--mui-palette-success-main, #1E9E5A)"
                    />
                  ) : (
                    <Ban
                      size={20}
                      color="var(--mui-palette-text-disabled, #9CA3AF)"
                    />
                  )}
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      {userType}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {scheme.applicableUsers.includes(userType)
                        ? 'Eligible'
                        : 'Not Eligible'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        <SectionCard title="Participant Statistics">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Total Participants"
                value={scheme.totalParticipants.toLocaleString('en-IN')}
                icon={<Users size={20} />}
                iconColor="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Total Product Scans"
                value={scheme.totalProductScans.toLocaleString('en-IN')}
                icon={<ScanLine size={20} />}
                iconColor="secondary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Completion Rate"
                value={`${scheme.completionRate}%`}
                icon={<Gauge size={20} />}
                iconColor="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Avg. Reward / Participant"
                value={avgRewardPerParticipant.toLocaleString('en-IN')}
                icon={<Trophy size={20} />}
                iconColor="warning"
              />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Reward Distribution">
          <DetailFieldGrid
            fields={[
              {
                label: 'Reward Points Issued',
                value: scheme.rewardPointsIssued.toLocaleString('en-IN'),
              },
              {
                label: 'Total Product Scans',
                value: scheme.totalProductScans.toLocaleString('en-IN'),
              },
              {
                label: 'Average Reward per Participant',
                value: avgRewardPerParticipant.toLocaleString('en-IN'),
              },
              {
                label: 'Maximum Reward Cap',
                value: scheme.maximumReward.toLocaleString('en-IN'),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Performance Analytics">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Total Participants"
                value={scheme.totalParticipants.toLocaleString('en-IN')}
                icon={<Users size={20} />}
                iconColor="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Total Product Scans"
                value={scheme.totalProductScans.toLocaleString('en-IN')}
                icon={<ScanLine size={20} />}
                iconColor="secondary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Reward Points Issued"
                value={scheme.rewardPointsIssued.toLocaleString('en-IN')}
                icon={<Trophy size={20} />}
                iconColor="warning"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                label="Completion Rate"
                value={`${scheme.completionRate}%`}
                icon={<Gauge size={20} />}
                iconColor="success"
              />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Scheme Timeline">
          <ActivityTimeline
            entries={scheme.timeline}
            emptyTitle="No timeline activity yet"
          />
        </SectionCard>

        <SectionCard title="Completion Report">
          <DetailFieldGrid
            fields={[
              { label: 'Completion Rate', value: `${scheme.completionRate}%` },
              { label: 'Target Quantity', value: scheme.targetQuantity },
              { label: 'Scan Target', value: scheme.scanTarget },
              {
                label: 'Scheme Status',
                value: (
                  <Chip
                    size="small"
                    label={statusConfig[report.status].label}
                    color={statusConfig[report.status].color}
                  />
                ),
              },
              { label: 'Start Date', value: report.startDate },
              { label: 'End Date', value: report.endDate ?? 'Ongoing' },
            ]}
          />
        </SectionCard>
      </Stack>
    </>
  )
}
