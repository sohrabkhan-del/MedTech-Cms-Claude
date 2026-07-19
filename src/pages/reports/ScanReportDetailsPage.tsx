import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { ScanLine, ArrowLeft as ArrowBackOutlined, Coins, MapPin, Wallet as WalletIcon, CheckCircle2 } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getScanReportById } from '@/features/reports/mockScanReports'
import type { ScanReportResult, ScanReportWalletStatus } from '@/types/scanReport'

const resultConfig: Record<ScanReportResult, { label: string; color: 'success' | 'warning' | 'error' }> = {
  valid: { label: 'Valid', color: 'success' },
  duplicate: { label: 'Duplicate', color: 'warning' },
  invalid: { label: 'Invalid', color: 'error' },
}

const walletStatusConfig: Record<ScanReportWalletStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  credited: { label: 'Credited', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
}

export function ScanReportDetailsPage() {
  const navigate = useNavigate()
  const { scanId } = useParams<{ scanId: string }>()
  const report = scanId ? getScanReportById(scanId) : undefined

  if (!report) {
    return (
      <EmptyState
        title="Scan report not found"
        description="This scan report may have been removed."
        actionLabel="Back to Scan Reports"
        onAction={() => navigate('/reports/scan-reports')}
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
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <ScanLine size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{report.barcodeNumber}</Typography>
              <Chip size="small" label={resultConfig[report.scanResult].label} color={resultConfig[report.scanResult].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {report.id} · {report.productName}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={18} />} onClick={() => navigate('/reports/scan-reports')} sx={{ fontSize: '0.8125rem' }}>
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Scan Result" value={resultConfig[report.scanResult].label} icon={<CheckCircle2 size={20} />} iconColor={report.scanResult === 'valid' ? 'success' : 'error'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Reward Points" value={report.rewardPoints.toLocaleString('en-IN')} icon={<Coins size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Wallet Status" value={walletStatusConfig[report.walletStatus].label} icon={<WalletIcon size={20} />} iconColor={report.walletStatus === 'credited' ? 'success' : report.walletStatus === 'pending' ? 'warning' : 'error'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Scan Location" value={report.locationName} icon={<MapPin size={20} />} iconColor="primary" />
          </Grid>
        </Grid>

        <SectionCard title="Scan Information">
          <DetailFieldGrid
            fields={[
              { label: 'Scan ID', value: report.id },
              { label: 'Scan Date & Time', value: report.scanDateTime },
              { label: 'Barcode Number', value: report.barcodeNumber },
              { label: 'Scan Result', value: <Chip size="small" label={resultConfig[report.scanResult].label} color={resultConfig[report.scanResult].color} /> },
              { label: 'Device', value: report.device },
              { label: 'IP Address', value: report.ipAddress },
            ]}
          />
        </SectionCard>

        <SectionCard title="Product Information">
          <DetailFieldGrid
            fields={[
              { label: 'Product Name', value: report.productName },
              { label: 'Product Code', value: report.productCode },
              { label: 'Product Category', value: report.productCategory },
              { label: 'Batch Number', value: report.batchNumber },
            ]}
          />
        </SectionCard>

        <SectionCard title="Dealer / Chemist Information">
          <DetailFieldGrid
            fields={[
              { label: 'Dealer Name', value: report.dealerName ?? '—' },
              { label: 'Chemist Name', value: report.chemistName ?? '—' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Geo-location">
          <DetailFieldGrid
            fields={[
              { label: 'Location Name', value: report.locationName },
              { label: 'Latitude', value: report.latitude.toFixed(4) },
              { label: 'Longitude', value: report.longitude.toFixed(4) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Reward Calculation">
          <DetailFieldGrid
            fields={[
              { label: 'Base Reward Points', value: report.baseRewardPoints.toLocaleString('en-IN') },
              { label: 'Bonus Points', value: report.bonusPoints.toLocaleString('en-IN') },
              { label: 'Total Reward Points', value: report.rewardPoints.toLocaleString('en-IN') },
              { label: 'Applied Scheme', value: report.appliedScheme },
              { label: 'Wallet Status', value: <Chip size="small" label={walletStatusConfig[report.walletStatus].label} color={walletStatusConfig[report.walletStatus].color} /> },
              { label: 'Wallet Transaction ID', value: report.walletTransactionId ?? '—' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Scan Timeline">
          <ActivityTimeline entries={report.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>
      </Stack>
    </>
  )
}
