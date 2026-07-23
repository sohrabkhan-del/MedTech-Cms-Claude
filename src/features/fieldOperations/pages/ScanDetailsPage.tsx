import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Chip, Grid, Stack, Typography, Button } from '@mui/material'
import {
  ScanLine as QrCodeScannerIcon,
  CircleCheck as CheckCircleOutlined,
  XCircle as CancelOutlined,
  ArrowLeft as ArrowBackOutlined,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { ScanResultChip } from '@/features/fieldOperations/components/ScanResultChip'
import { useScanEventDetail } from '@/features/fieldOperations/hooks/useScanEventDetail'

function ValidationRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', py: 0.75 }}>
      {passed ? (
        <Box component="span" sx={{ display: 'inline-flex', color: 'success.main' }}>
          <CheckCircleOutlined size={20} />
        </Box>
      ) : (
        <Box component="span" sx={{ display: 'inline-flex', color: 'error.main' }}>
          <CancelOutlined size={20} />
        </Box>
      )}
      <Typography variant="body1">{label}</Typography>
    </Stack>
  )
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
            <QrCodeScannerIcon size={18} />
          </Box>
          <Box>
            <Typography variant="h1">{selectedScan.scanCode}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {selectedScan.id} · {selectedScan.productName}
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
              { label: 'Scan Code', value: selectedScan.scanCode },
              { label: 'Product Name', value: selectedScan.productName },
              { label: 'Product Code', value: selectedScan.productCode },
              { label: 'Batch Number', value: selectedScan.batchNumber },
              { label: 'Scan Date & Time', value: selectedScan.scanDateTime },
              { label: 'Reward Points Earned', value: selectedScan.rewardPoints.toString() },
              { label: 'Scan Result', value: <ScanResultChip result={selectedScan.result} /> },
            ]}
          />
        </SectionCard>

        <SectionCard title="User Information">
          <DetailFieldGrid
            fields={[
              {
                label: 'User Name',
                value: (
                  <Typography
                    sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => navigate(`/field-operations/live-scan-feed/user/${selectedScan.userId}`)}
                  >
                    {selectedScan.userName}
                  </Typography>
                ),
              },
              { label: 'User Type', value: selectedScan.userRole },
              { label: 'Registered Location', value: selectedScan.businessName },
              { label: 'Assigned Region', value: selectedScan.region },
              { label: 'Business Name', value: selectedScan.businessName },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                Scan Validation Details
              </Typography>
              <ValidationRow
                label="Code Validation"
                passed={selectedScan.validation.codeValidation === 'passed'}
              />
              <ValidationRow
                label="Duplicate Scan Check"
                passed={selectedScan.validation.duplicateScanCheck === 'passed'}
              />
              <ValidationRow
                label="Geo-fence Validation"
                passed={selectedScan.validation.geoFenceValidation === 'passed'}
              />
              <ValidationRow
                label="Product Eligibility"
                passed={selectedScan.validation.productEligibility === 'passed'}
              />
              <ValidationRow
                label="Reward Eligibility"
                passed={selectedScan.validation.rewardEligibility === 'passed'}
              />
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
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
                  ['Latitude', selectedScan.location.latitude.toFixed(4)],
                  ['Longitude', selectedScan.location.longitude.toFixed(4)],
                  [
                    'Registered Geo-fence',
                    `${selectedScan.location.registeredGeoFenceRadiusMeters} m`,
                  ],
                  [
                    'Distance from Registered',
                    `${selectedScan.location.distanceFromRegisteredMeters} m`,
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
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        mt: 0.25,
                      }}
                    >
                      {value}
                    </Typography>
                  </Grid>
                ))}
                <Grid size={12}>
                  <Chip
                    label={
                      selectedScan.location.geoFenceValidationResult === 'within_range'
                        ? 'Within Range'
                        : 'Outside Range'
                    }
                    size="small"
                    color={
                      selectedScan.location.geoFenceValidationResult === 'within_range'
                        ? 'success'
                        : 'error'
                    }
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>

        <SectionCard title="Technical Information">
          <DetailFieldGrid
            fields={[
              { label: 'Source IP Address', value: selectedScan.technical.sourceIp },
              { label: 'Device Information', value: selectedScan.technical.deviceInfo },
              { label: 'Scan Timestamp', value: selectedScan.scanDateTime },
              { label: 'Application Version', value: selectedScan.technical.appVersion },
            ]}
          />
        </SectionCard>
      </Stack>
    </>
  )
}
