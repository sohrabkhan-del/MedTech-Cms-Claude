import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined'
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined'
import RoomOutlined from '@mui/icons-material/RoomOutlined'
import QrCode2Outlined from '@mui/icons-material/QrCode2Outlined'
import ToggleOnOutlined from '@mui/icons-material/ToggleOnOutlined'
import DoneAllOutlined from '@mui/icons-material/DoneAllOutlined'
import HourglassEmptyOutlined from '@mui/icons-material/HourglassEmptyOutlined'
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined'
import type { DistributionJourneyEntry, ProductionBatch, RelatedScheme } from '@/types/productBatch'

const statusColor: Record<ProductionBatch['status'], 'success' | 'default' | 'error'> = {
  active: 'success',
  inactive: 'default',
  expired: 'error',
}

const schemeStatusColor: Record<RelatedScheme['status'], 'success' | 'info' | 'error'> = {
  active: 'success',
  upcoming: 'info',
  expired: 'error',
}

const distributionColumns: CommonTableColumn<DistributionJourneyEntry>[] = [
  { key: 'distributor', header: 'Distributor', minWidth: 170, render: (row) => row.distributor },
  { key: 'dealer', header: 'Dealer', minWidth: 150, render: (row) => row.dealer },
  { key: 'chemist', header: 'Chemist', minWidth: 150, render: (row) => row.chemist },
  { key: 'purchaseDate', header: 'Purchase Date', minWidth: 130, render: (row) => row.purchaseDate },
  { key: 'currentOwner', header: 'Current Owner', minWidth: 150, render: (row) => row.currentOwner },
]

interface BatchDetailsViewProps {
  batch: ProductionBatch
  onBack: () => void
}

export function BatchDetailsView({ batch, onBack }: BatchDetailsViewProps) {
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
            <Inventory2Outlined fontSize="small" />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{batch.batchNo}</Typography>
              <Chip size="small" label={statusColor[batch.status] === 'success' ? 'Active' : batch.status === 'expired' ? 'Expired' : 'Inactive'} color={statusColor[batch.status]} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {batch.productName} · {batch.productCode}
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" startIcon={<ArrowBackOutlined fontSize="small" />} onClick={onBack} sx={{ fontSize: '0.75rem' }}>
          Back to Batch Listing
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Batch Number', value: batch.batchNo },
              { label: 'Product Name', value: batch.productName },
              { label: 'Product Code', value: batch.productCode },
              { label: 'Category', value: batch.productCategory },
              { label: 'Manufacturing Date', value: batch.manufacturingDate },
              { label: 'Expiry Date', value: batch.expiryDate },
              { label: 'Coin Value', value: batch.coinValue },
              { label: 'Total Packages', value: batch.totalPackages.toLocaleString('en-IN') },
              { label: 'Scan Status', value: `${batch.totalScans.toLocaleString('en-IN')} / ${batch.totalPackages.toLocaleString('en-IN')} scanned` },
            ]}
          />
        </SectionCard>

        <SectionCard title="QR / Barcode Information">
          <DetailFieldGrid
            fields={[
              { label: 'Barcode Series', value: batch.qrBarcodeInfo.barcodeSeries },
              { label: 'Serial Number Range', value: `${batch.qrBarcodeInfo.serialRangeStart} – ${batch.qrBarcodeInfo.serialRangeEnd}` },
              { label: 'Total Generated', value: batch.qrBarcodeInfo.totalGenerated.toLocaleString('en-IN') },
              { label: 'Total Available', value: batch.qrBarcodeInfo.totalAvailable.toLocaleString('en-IN') },
              { label: 'Total Scanned', value: batch.qrBarcodeInfo.totalScanned.toLocaleString('en-IN') },
              { label: 'Duplicate Scans', value: batch.qrBarcodeInfo.duplicateScans },
            ]}
          />
        </SectionCard>

        <SectionCard title="Distribution Journey">
          <CommonTable
            tableKey="production-batch-distribution-journey"
            columns={distributionColumns}
            rows={batch.distributionJourney}
            getRowId={(row) => row.id}
            searchPlaceholder="Search distribution journey…"
            searchKeys={(row) => `${row.distributor} ${row.dealer} ${row.chemist}`}
            emptyTitle="No distribution records yet"
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Successful Scans" value={batch.scanStatistics.totalSuccessfulScans.toLocaleString('en-IN')} icon={<CheckCircleOutlined fontSize="small" />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Failed Scans" value={batch.scanStatistics.failedScans} icon={<CancelOutlined fontSize="small" />} iconColor="error" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Duplicate Scans" value={batch.scanStatistics.duplicateScans} icon={<ContentCopyOutlined fontSize="small" />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Geo-fence Violations" value={batch.scanStatistics.geoFenceViolations} icon={<RoomOutlined fontSize="small" />} iconColor="secondary" />
          </Grid>
        </Grid>

        <SectionCard title="Reward Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Base Coin Value', value: batch.rewardSummary.baseCoinValue },
              { label: 'Bonus Coins', value: batch.rewardSummary.bonusCoins },
              { label: 'Applied Scheme', value: batch.rewardSummary.appliedScheme },
              { label: 'Total Reward Points Issued', value: batch.rewardSummary.totalRewardPointsIssued.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>

        <SectionCard title="Batch Timeline">
          <ActivityTimeline entries={batch.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Batch Upload History">
          <DetailFieldGrid
            fields={
              batch.uploadHistory[0]
                ? [
                    { label: 'Upload File', value: batch.uploadHistory[0].uploadFile },
                    { label: 'Uploaded By', value: batch.uploadHistory[0].uploadedBy },
                    { label: 'Upload Date', value: batch.uploadHistory[0].uploadDate },
                    { label: 'Total Records', value: batch.uploadHistory[0].totalRecords.toLocaleString('en-IN') },
                    { label: 'Success', value: batch.uploadHistory[0].success.toLocaleString('en-IN') },
                    { label: 'Failed', value: batch.uploadHistory[0].failed },
                  ]
                : []
            }
          />
        </SectionCard>

        <SectionCard title="QR Code Statistics">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Total QR Generated" value={batch.qrCodeStatistics.totalGenerated.toLocaleString('en-IN')} icon={<QrCode2Outlined fontSize="small" />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="QR Activated" value={batch.qrCodeStatistics.activated.toLocaleString('en-IN')} icon={<ToggleOnOutlined fontSize="small" />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="QR Scanned" value={batch.qrCodeStatistics.scanned.toLocaleString('en-IN')} icon={<DoneAllOutlined fontSize="small" />} iconColor="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="QR Remaining" value={batch.qrCodeStatistics.remaining.toLocaleString('en-IN')} icon={<HourglassEmptyOutlined fontSize="small" />} iconColor="warning" />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Fraud Detection">
          <DetailFieldGrid
            fields={[
              { label: 'Duplicate Scan Count', value: batch.fraudDetection.duplicateScanCount },
              { label: 'Invalid Barcode Count', value: batch.fraudDetection.invalidBarcodeCount },
              { label: 'Outside Geo-fence', value: batch.fraudDetection.outsideGeoFence },
              { label: 'Suspicious Activity', value: batch.fraudDetection.suspiciousActivity },
            ]}
          />
          {(batch.fraudDetection.suspiciousActivity > 0 || batch.fraudDetection.outsideGeoFence > 0) && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', mt: 2, p: 1.5, borderRadius: '10px', backgroundColor: 'error.light', color: 'error.main' }}
            >
              <WarningAmberOutlined fontSize="small" />
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                This batch has flagged activity — review scan locations and duplicate attempts.
              </Typography>
            </Stack>
          )}
        </SectionCard>

        <SectionCard title="Related Schemes">
          <Stack spacing={1.5}>
            {batch.relatedSchemes.map((scheme) => (
              <Stack
                key={scheme.id}
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{scheme.schemeName}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{scheme.schemeType}</Typography>
                </Box>
                <Chip size="small" label={scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)} color={schemeStatusColor[scheme.status]} />
              </Stack>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard title="Related Rewards">
          <DetailFieldGrid
            fields={[
              { label: 'Total Rewards Generated', value: batch.relatedRewards.totalRewardsGenerated.toLocaleString('en-IN') },
              { label: 'Dealer Rewards', value: batch.relatedRewards.dealerRewards.toLocaleString('en-IN') },
              { label: 'Chemist Rewards', value: batch.relatedRewards.chemistRewards.toLocaleString('en-IN') },
              { label: 'Redeemed Rewards', value: batch.relatedRewards.redeemedRewards.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>
      </Stack>
    </>
  )
}
