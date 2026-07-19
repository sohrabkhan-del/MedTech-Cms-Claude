import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import {
  FileBarChart as FileBarChartIcon,
  ArrowLeft as ArrowLeftIcon,
  Mail,
  Phone,
  MapPin,
  Wallet as WalletIcon,
  ScanLine as ScanLineIcon,
  Gift as GiftIcon,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getChemistReportById, getChemistPerformanceSummary } from '@/features/reports/mockChemistReports'
import type { ScanHistoryEntry, PointsHistoryEntry, InterestedProductEntry } from '@/types/partner'

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

export function ChemistReportDetailsPage() {
  const { chemistReportId } = useParams<{ chemistReportId: string }>()
  const navigate = useNavigate()
  const report = getChemistReportById(chemistReportId ?? '')
  const summary = getChemistPerformanceSummary(chemistReportId ?? '')

  if (!report || !summary) {
    return (
      <EmptyState
        title="Chemist report not found"
        description="This chemist report may have been removed."
        actionLabel="Back to Chemist Reports"
        onAction={() => navigate('/reports/chemist-reports')}
      />
    )
  }

  const { chemist } = report

  const scanColumns: CommonTableColumn<ScanHistoryEntry>[] = [
    { key: 'scanDate', header: 'Scan Date', sortable: true, render: (row) => row.scanDate },
    { key: 'barcodeNumber', header: 'Barcode Number', render: (row) => row.barcodeNumber },
    { key: 'productName', header: 'Product Name', sortable: true, render: (row) => row.productName },
    {
      key: 'rewardPoints',
      header: 'Reward Points',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.rewardPoints,
      render: (row) => row.rewardPoints,
    },
    {
      key: 'result',
      header: 'Result',
      sortable: true,
      render: (row) => (
        <Chip
          label={row.result.charAt(0).toUpperCase() + row.result.slice(1)}
          size="small"
          color={row.result === 'valid' ? 'success' : row.result === 'duplicate' ? 'warning' : 'error'}
          variant="filled"
        />
      ),
    },
  ]

  const walletColumns: CommonTableColumn<PointsHistoryEntry>[] = [
    { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
    { key: 'transactionId', header: 'Transaction ID', render: (row) => row.transactionId },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (row) => (
        <Chip
          label={row.type === 'credit' ? 'Credit' : 'Debit'}
          size="small"
          color={row.type === 'credit' ? 'success' : 'error'}
          variant="filled"
        />
      ),
    },
    {
      key: 'points',
      header: 'Points',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.points,
      render: (row) => row.points,
    },
    { key: 'description', header: 'Description', render: (row) => row.description },
    {
      key: 'balanceAfter',
      header: 'Balance After',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.balanceAfter,
      render: (row) => row.balanceAfter.toLocaleString('en-IN'),
    },
  ]

  const redemptionColumns: CommonTableColumn<PointsHistoryEntry>[] = [
    { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
    { key: 'transactionId', header: 'Transaction ID', render: (row) => row.transactionId },
    {
      key: 'points',
      header: 'Points Redeemed',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.points,
      render: (row) => row.points,
    },
    { key: 'description', header: 'Description', render: (row) => row.description },
    {
      key: 'balanceAfter',
      header: 'Balance After',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.balanceAfter,
      render: (row) => row.balanceAfter.toLocaleString('en-IN'),
    },
  ]

  const interestedProductColumns: CommonTableColumn<InterestedProductEntry>[] = [
    { key: 'productName', header: 'Product Name', sortable: true, render: (row) => row.productName },
    { key: 'requestedDate', header: 'Requested Date', sortable: true, render: (row) => row.requestedDate },
    { key: 'handledBy', header: 'Handled By', render: (row) => row.handledBy },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <Chip
          label={row.status === 'in_progress' ? 'In Progress' : row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          size="small"
          color={row.status === 'closed' ? 'success' : row.status === 'in_progress' ? 'warning' : 'info'}
          variant="filled"
        />
      ),
    },
  ]

  const redemptionEntries = chemist.pointsHistory.filter((entry) => entry.type === 'debit')

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
            <FileBarChartIcon size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h1">{report.chemistName}</Typography>
              <StatusBadge status={report.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {report.id} · Chemist Report · {report.zone}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowLeftIcon size={18} />}
          onClick={() => navigate('/reports/chemist-reports')}
          sx={{ fontSize: '0.8125rem' }}
        >
          Back
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard
          title="Chemist Summary"
          action={<Chip size="small" label={`Chemist ID: ${chemist.id}`} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />}
        >
          <Stack direction="row" spacing={2.5} sx={{ mb: 3, alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
              {chemist.shopName.slice(0, 1)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{chemist.shopName}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {chemist.ownerName} · {chemist.zone} Zone
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Mail size={16} />} label="Email Address" value={chemist.email} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Phone size={16} />} label="Contact Number" value={chemist.phone} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<MapPin size={16} />} label="City" value={chemist.city} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<MapPin size={16} />} label="Registered Address" value={chemist.registeredAddress} />
            </Grid>
          </Grid>

          <DetailFieldGrid
            fields={[
              { label: 'License Number', value: chemist.licenseNumber },
              { label: 'Onboarded By', value: chemist.onboardedBy },
              { label: 'Assigned MR', value: chemist.assignedMr },
              { label: 'Geo-tag Status', value: chemist.geoTagStatus === 'tagged' ? 'Tagged' : 'Pending' },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Scans" value={summary.totalScans.toLocaleString('en-IN')} icon={<ScanLineIcon size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Wallet Balance" value={summary.currentWalletBalance.toLocaleString('en-IN')} icon={<WalletIcon size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Redemptions" value={summary.totalRedemptions} icon={<GiftIcon size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Scan Success Rate" value={`${summary.scanSuccessRate}%`} icon={<TrendingUpIcon size={20} />} iconColor="success" />
          </Grid>
        </Grid>

        <SectionCard title="Performance Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Valid Scans', value: summary.validScans },
              { label: 'Duplicate Scans', value: summary.duplicateScans },
              { label: 'Invalid Scans', value: summary.invalidScans },
              { label: 'Average Points / Scan', value: summary.averagePointsPerScan },
              { label: 'Total Points Earned', value: summary.totalPointsEarned.toLocaleString('en-IN') },
              { label: 'Total Points Redeemed', value: summary.totalPointsRedeemed.toLocaleString('en-IN') },
              { label: 'Current Wallet Balance', value: summary.currentWalletBalance.toLocaleString('en-IN') },
              { label: 'Scan Success Rate', value: `${summary.scanSuccessRate}%` },
            ]}
          />
        </SectionCard>

        <SectionCard title="Scan History">
          <CommonTable
            tableKey="chemist-report-scan-history"
            columns={scanColumns}
            rows={chemist.scanHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search scans…"
            searchKeys={(row) => `${row.productName} ${row.barcodeNumber}`}
            defaultSortBy="scanDate"
            emptyTitle="No scan history"
            emptyDescription="This chemist has no recorded scans yet."
          />
        </SectionCard>

        <SectionCard title="Wallet History">
          <CommonTable
            tableKey="chemist-report-wallet-history"
            columns={walletColumns}
            rows={chemist.pointsHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search wallet transactions…"
            searchKeys={(row) => `${row.transactionId} ${row.description}`}
            defaultSortBy="date"
            emptyTitle="No wallet history"
            emptyDescription="This chemist has no wallet transactions yet."
          />
        </SectionCard>

        <SectionCard title="Interested Products">
          <CommonTable
            tableKey="chemist-report-interested-products"
            columns={interestedProductColumns}
            rows={chemist.interestedProducts}
            getRowId={(row) => row.id}
            searchPlaceholder="Search interested products…"
            searchKeys={(row) => `${row.productName} ${row.handledBy}`}
            defaultSortBy="requestedDate"
            emptyTitle="No interested products"
            emptyDescription="This chemist has not shown interest in any products yet."
          />
        </SectionCard>

        <SectionCard title="Redemption History">
          <CommonTable
            tableKey="chemist-report-redemption-history"
            columns={redemptionColumns}
            rows={redemptionEntries}
            getRowId={(row) => row.id}
            searchPlaceholder="Search redemptions…"
            searchKeys={(row) => `${row.transactionId} ${row.description}`}
            defaultSortBy="date"
            emptyTitle="No redemptions yet"
            emptyDescription="This chemist has not redeemed any points yet."
          />
        </SectionCard>
      </Stack>
    </Stack>
  )
}
