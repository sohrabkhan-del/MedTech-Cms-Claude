import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ChartColumnBig as ChartColumnBigIcon,
  ArrowLeft as ArrowLeftIcon,
  Mail,
  Phone,
  MapPin,
  Clock,
  Store as StoreIcon,
  Pill as PillIcon,
  ScanLine as ScanLineIcon,
  Coins as CoinsIcon,
  TrendingUp as TrendingUpIcon,
  Gauge as GaugeIcon,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { ChartCard } from '@/components/common/ChartCard/ChartCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getMrPerformanceDetails } from '@/features/reports/mockMrPerformanceReports'
import type { MrMonthlyActivity } from '@/types/mrPerformanceReport'
import type { MrManagedPartner } from '@/types/medicalRep'

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          color: 'text.secondary',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', wordBreak: 'break-word' }}>{value}</Typography>
      </Box>
    </Stack>
  )
}

function performanceColor(score: number): 'success' | 'warning' | 'error' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'error'
}

export function MrPerformanceDetailsPage() {
  const { mrReportId } = useParams<{ mrReportId: string }>()
  const navigate = useNavigate()
  const details = getMrPerformanceDetails(mrReportId ?? '')

  if (!details) {
    return (
      <EmptyState
        title="MR performance report not found"
        description="This MR performance report may have been removed."
        actionLabel="Back to MR Performance"
        onAction={() => navigate('/reports/mr-performance')}
      />
    )
  }

  const { report, assignedDealers, assignedChemists, scanContribution, analytics, monthlyActivity } = details
  const { mr } = report

  const partnerColumns: CommonTableColumn<MrManagedPartner>[] = [
    { key: 'partnerName', header: 'Partner Name', minWidth: 200, sortable: true, sortValue: (row) => row.partnerName, render: (row) => row.partnerName },
    { key: 'city', header: 'City', sortable: true, render: (row) => row.city },
    { key: 'region', header: 'Region', sortable: true, render: (row) => row.region },
    { key: 'source', header: 'Source', sortable: true, render: (row) => row.source },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  const monthlyColumns: CommonTableColumn<MrMonthlyActivity>[] = [
    { key: 'month', header: 'Month', sortable: true, render: (row) => row.month },
    {
      key: 'scans',
      header: 'Scans',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.scans,
      render: (row) => row.scans.toLocaleString('en-IN'),
    },
    {
      key: 'rewardsIssued',
      header: 'Rewards Issued',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.rewardsIssued,
      render: (row) => row.rewardsIssued.toLocaleString('en-IN'),
    },
    {
      key: 'onboardings',
      header: 'Onboardings',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.onboardings,
      render: (row) => row.onboardings,
    },
  ]

  return (
    <Stack spacing={0}>
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}
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
              flexShrink: 0,
            }}
          >
            <ChartColumnBigIcon size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h1">{report.mrName}</Typography>
              <StatusBadge status={report.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {report.id} · MR Performance · {report.region}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowLeftIcon size={18} />}
          onClick={() => navigate('/reports/mr-performance')}
          sx={{ fontSize: '0.8125rem' }}
        >
          Back
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard
          title="MR Summary"
          action={<Chip size="small" label={`MR ID: ${mr.id}`} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />}
        >
          <Stack direction="row" spacing={2.5} sx={{ mb: 3, alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
              {mr.name.slice(0, 1)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{mr.name}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Field Representative · {mr.region} Region
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Mail size={16} />} label="Email Address" value={mr.email} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Phone size={16} />} label="Contact Number" value={mr.phone} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<MapPin size={16} />} label="Region" value={mr.region} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Clock size={16} />} label="Last Login" value={mr.lastLogin} />
            </Grid>
          </Grid>

          <DetailFieldGrid
            fields={[
              { label: 'Dealers Onboarded', value: report.dealersOnboarded },
              { label: 'Chemists Onboarded', value: report.chemistsOnboarded },
              { label: 'Total Partners Managed', value: mr.totalPartnersManaged },
              {
                label: 'Performance Score',
                value: <Chip size="small" label={`${report.performanceScore} / 100`} color={performanceColor(report.performanceScore)} variant="filled" />,
              },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Scans" value={scanContribution.totalScans.toLocaleString('en-IN')} icon={<ScanLineIcon size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Reward Points Generated"
              value={scanContribution.totalRewardPointsGenerated.toLocaleString('en-IN')}
              icon={<CoinsIcon size={20} />}
              iconColor="secondary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Onboarding Rate" value={`${analytics.onboardingRate}%`} icon={<TrendingUpIcon size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Engagement Score" value={`${analytics.engagementScore} / 100`} icon={<GaugeIcon size={20} />} iconColor="warning" />
          </Grid>
        </Grid>

        <SectionCard title="Scan Contribution">
          <DetailFieldGrid
            fields={[
              { label: 'Total Scans', value: scanContribution.totalScans.toLocaleString('en-IN') },
              { label: 'Total Reward Points Generated', value: scanContribution.totalRewardPointsGenerated.toLocaleString('en-IN') },
              { label: 'Average Scans / Month', value: scanContribution.averageScansPerMonth.toLocaleString('en-IN') },
              { label: 'Average Rewards / Month', value: scanContribution.averageRewardsPerMonth.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>

        <SectionCard title="Performance Analytics">
          <DetailFieldGrid
            fields={[
              { label: 'Onboarding Rate', value: `${analytics.onboardingRate}%` },
              { label: 'Engagement Score', value: `${analytics.engagementScore} / 100` },
              { label: 'Average Scans / Partner', value: analytics.averageScansPerPartner.toLocaleString('en-IN') },
              { label: 'Active Partner Ratio', value: `${analytics.activePartnerRatio}%` },
            ]}
          />
        </SectionCard>

        <ChartCard title="Monthly Activity" subtitle="Scan volume trend over the last 6 months" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyActivity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4A4A4A' }} tickLine={false} axisLine={{ stroke: '#E5E5E5' }} />
              <YAxis tick={{ fontSize: 11, fill: '#4A4A4A' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [`${value} Scans`, 'Scans']} cursor={{ fill: 'rgba(26,62,140,0.04)' }} />
              <Bar dataKey="scans" name="Scans" fill="#1A3E8C" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <SectionCard title="Monthly Activity Breakdown">
          <CommonTable
            tableKey="mr-performance-monthly-activity"
            columns={monthlyColumns}
            rows={monthlyActivity}
            getRowId={(row) => row.id}
            searchPlaceholder="Search months…"
            searchKeys={(row) => row.month}
            defaultSortBy="month"
            emptyTitle="No monthly activity"
            emptyDescription="No activity has been recorded for this MR yet."
          />
        </SectionCard>

        <SectionCard title="Assigned Dealers">
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Total Dealers" value={assignedDealers.length} icon={<StoreIcon size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Active Dealers"
                value={assignedDealers.filter((d) => d.status === 'active').length}
                icon={<StoreIcon size={20} />}
                iconColor="success"
              />
            </Grid>
          </Grid>
          <CommonTable
            tableKey="mr-performance-assigned-dealers"
            columns={partnerColumns}
            rows={assignedDealers}
            getRowId={(row) => row.id}
            searchPlaceholder="Search dealers…"
            searchKeys={(row) => `${row.partnerName} ${row.city}`}
            defaultSortBy="partnerName"
            emptyTitle="No dealers assigned"
            emptyDescription="This MR has no assigned dealers yet."
          />
        </SectionCard>

        <SectionCard title="Assigned Chemists">
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Total Chemists" value={assignedChemists.length} icon={<PillIcon size={20} />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Active Chemists"
                value={assignedChemists.filter((c) => c.status === 'active').length}
                icon={<PillIcon size={20} />}
                iconColor="success"
              />
            </Grid>
          </Grid>
          <CommonTable
            tableKey="mr-performance-assigned-chemists"
            columns={partnerColumns}
            rows={assignedChemists}
            getRowId={(row) => row.id}
            searchPlaceholder="Search chemists…"
            searchKeys={(row) => `${row.partnerName} ${row.city}`}
            defaultSortBy="partnerName"
            emptyTitle="No chemists assigned"
            emptyDescription="This MR has no assigned chemists yet."
          />
        </SectionCard>
      </Stack>
    </Stack>
  )
}
