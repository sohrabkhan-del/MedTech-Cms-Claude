import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Chip, Grid, Stack, Typography, Button } from '@mui/material'
import {
  ScanLine as QrCodeScannerIcon,
  ArrowLeft as ArrowBackOutlined,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { ScanResultChip } from '@/features/fieldOperations/components/ScanResultChip'
import { useScanEventDetail } from '@/features/fieldOperations/hooks/useScanEventDetail'

const formatCoordinate = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return value.toFixed(6)
}

export function ScanDetailsPage() {
  const navigate = useNavigate()
  const { scanId } = useParams<{ scanId: string }>()
  const { scanEvent: selectedScan, isLoading } = useScanEventDetail(scanId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!selectedScan) {
    return (
      <EmptyState
        title="Scan not found"
        description="This scan may have been removed."
        actionLabel="Back to Live Scan Feed"
        onAction={() => navigate('/field-operations/live-scan-feed')}
      />
    )
  }

  const distanceFromTaggedLocation = Number(
    selectedScan.distanceFromTaggedLocation ?? 0,
  )
  const geofenceAllowed = Number(selectedScan.geofenceAllowed ?? 0)
  const withinGeofence = distanceFromTaggedLocation <= geofenceAllowed

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
            <QrCodeScannerIcon size={18} />
          </Box>
          <Box>
            <Typography variant="h1">{selectedScan.scannedCode}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {selectedScan.referenceId} ·{' '}
              {selectedScan.productDetails.productCode}
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined size={18} />}
          onClick={() => navigate('/field-operations/live-scan-feed')}
          sx={{ fontSize: '0.8125rem' }}
        >
          Back
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Scan Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Scan ID', value: selectedScan.id },
              { label: 'Reference ID', value: selectedScan.referenceId },
              { label: 'Scanned Code', value: selectedScan.scannedCode },
              {
                label: 'Product Code',
                value: selectedScan.productDetails.productCode,
              },
              {
                label: 'Product Category',
                value: selectedScan.productDetails.productCategory ?? '-',
              },
              { label: 'Batch Number', value: selectedScan.batchNo },
              {
                label: 'Scan Date & Time',
                value: new Date(selectedScan.scannedAt).toLocaleString(
                  'en-IN',
                  {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  },
                ),
              },
              {
                label: 'Reward Points Earned',
                value:
                  selectedScan.rewardPointsEarned == null
                    ? '—'
                    : selectedScan.rewardPointsEarned.toLocaleString('en-IN'),
              },
              {
                label: 'Scan Result',
                value: (
                  <ScanResultChip
                    status={selectedScan.scanStatus}
                    label={selectedScan.scanResult}
                  />
                ),
              },
              { label: 'Scan Result Type', value: selectedScan.scanResultType },
              ...(selectedScan.rewardReason
                ? [{ label: 'Reward Reason', value: selectedScan.rewardReason }]
                : []),
            ]}
          />
        </SectionCard>

        <SectionCard title="Business Information">
          <DetailFieldGrid
            fields={[
              {
                label: 'Partner Name',
                value: (
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() =>
                      navigate(
                        `/field-operations/live-scan-feed/user/${selectedScan.partnerId}`,
                      )
                    }
                  >
                    {selectedScan.businessDetails.partnerName}
                  </Typography>
                ),
              },
              { label: 'Partner Type', value: selectedScan.partnerType },
              {
                label: 'Business Name',
                value: selectedScan.businessDetails.businessName,
              },
              {
                label: 'Outlet Name',
                value: selectedScan.businessDetails.outletName,
              },
              {
                label: 'Outlet User Name',
                value: selectedScan.businessDetails.outletUserName ?? '-',
              },
              { label: 'Assigned Region', value: selectedScan.region },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={12}>
            <Card sx={{ p: 3, height: '100%' }}>
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
                Geo-location Information
              </Typography>
              <Grid container spacing={2}>
                {[
                  ['Latitude', formatCoordinate(selectedScan.latitude)],
                  ['Longitude', formatCoordinate(selectedScan.longitude)],
                  [
                    'Registered Geo-fence',
                    selectedScan.geofenceAllowed == null
                      ? '—'
                      : `${selectedScan.geofenceAllowed} m`,
                  ],
                  [
                    'Buffer Geo-fence',
                    selectedScan.bufferGeofenceAllowed == null
                      ? '—'
                      : `${selectedScan.bufferGeofenceAllowed} m`,
                  ],
                  [
                    'Distance from Tagged Location',
                    selectedScan.distanceFromTaggedLocation == null
                      ? '—'
                      : `${selectedScan.distanceFromTaggedLocation} m`,
                  ],
                ].map(([label, value]) => (
                  <Grid key={label} size={6}>
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
                <Grid size={12}>
                  <Chip
                    label={withinGeofence ? 'Within Range' : 'Outside Range'}
                    size="small"
                    color={withinGeofence ? 'success' : 'error'}
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>

        <SectionCard title="Technical Information">
          <DetailFieldGrid
            fields={[
              {
                label: 'Source IP Address',
                value: selectedScan.technicalInformation.sourceIp,
              },
              {
                label: 'Device Information',
                value: selectedScan.technicalInformation.deviceInfo,
              },
              {
                label: 'Device UUID',
                value: selectedScan.technicalInformation.deviceUuid,
              },
              {
                label: 'Scan Timestamp',
                value: new Date(
                  selectedScan.technicalInformation.scanTimestamp,
                ).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
              },
              {
                label: 'Application Version',
                value: selectedScan.technicalInformation.appVersion,
              },
            ]}
          />
        </SectionCard>
      </Stack>
    </>
  )
}
