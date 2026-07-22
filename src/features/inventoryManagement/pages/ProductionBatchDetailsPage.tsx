import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import {
  ArrowLeft as ArrowBackOutlined,
  Package as Inventory2Outlined,
  CircleCheck as CheckCircleOutlined,
  XCircle as CancelOutlined,
  Copy as ContentCopyOutlined,
  MapPin as RoomOutlined,
  QrCode as QrCode2Outlined,
  ToggleRight as ToggleOnOutlined,
  CheckCheck as DoneAllOutlined,
  Hourglass as HourglassEmptyOutlined,
  TriangleAlert as WarningAmberOutlined,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useProductionBatchDetail } from '@/features/inventoryManagement/hooks/useProductionBatchDetail'
import type { DistributionJourneyEntry, ProductionBatch, RelatedScheme } from '@/features/inventoryManagement/types/inventoryManagement.types'

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

export function ProductionBatchDetailsPage() {
  const navigate = useNavigate()
  const { batchId } = useParams<{ batchId: string }>()
  const { batch, isLoading } = useProductionBatchDetail(batchId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={6} />
  }

  if (!batch) {
    return (
      <EmptyState
        title="Batch not found"
        description="This production batch may have been removed."
        actionLabel="Back to Product Batches"
        onAction={() => navigate('/inventory/product-batches')}
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
            <Inventory2Outlined size={20} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{batch.batchNo}</Typography>
              <Chip size="small" label={batch.status === 'active' ? 'Active' : batch.status === 'expired' ? 'Expired' : 'Inactive'} color={statusColor[batch.status]} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {batch.productName} · {batch.productCode}
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" startIcon={<ArrowBackOutlined size={20} />} onClick={() => navigate('/inventory/product-batches')} sx={{ fontSize: '0.75rem' }}>
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
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search distribution journey…"
            searchKeys={(row) => `${row.distributor} ${row.dealer} ${row.chemist}`}
            emptyTitle="No distribution records yet"
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Successful Scans" value={batch.scanStatistics.totalSuccessfulScans.toLocaleString('en-IN')} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Failed Scans" value={batch.scanStatistics.failedScans} icon={<CancelOutlined size={20} />} iconColor="error" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Duplicate Scans" value={batch.scanStatistics.duplicateScans} icon={<ContentCopyOutlined size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Geo-fence Violations" value={batch.scanStatistics.geoFenceViolations} icon={<RoomOutlined size={20} />} iconColor="secondary" />
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
              <StatCard label="Total QR Generated" value={batch.qrCodeStatistics.totalGenerated.toLocaleString('en-IN')} icon={<QrCode2Outlined size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="QR Activated" value={batch.qrCodeStatistics.activated.toLocaleString('en-IN')} icon={<ToggleOnOutlined size={20} />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="QR Scanned" value={batch.qrCodeStatistics.scanned.toLocaleString('en-IN')} icon={<DoneAllOutlined size={20} />} iconColor="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="QR Remaining" value={batch.qrCodeStatistics.remaining.toLocaleString('en-IN')} icon={<HourglassEmptyOutlined size={20} />} iconColor="warning" />
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
              <WarningAmberOutlined size={20} />
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
