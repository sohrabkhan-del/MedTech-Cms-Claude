import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import {
  Crosshair as MyLocationIcon,
  ScanLine as QrCodeScannerIcon,
  CircleCheck as CheckCircleOutlined,
  XCircle as CancelOutlined,
  ArrowLeft as ArrowBackOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { CommonTable } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { ScanResultChip } from '@/features/fieldOperations/components/ScanResultChip'
import { SCAN_RESULT_CONFIG } from '@/features/fieldOperations/scanResultConfig'
import { useScanUserProfile } from '@/features/fieldOperations/hooks/useScanUserProfile'

export function ScanUserProfilePage() {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const {
    summary: userSummary,
    history: userScanHistory,
    isLoading: userProfileLoading,
  } = useScanUserProfile(userId)

  const openScan = (scanId: string) => {
    navigate(`/field-operations/live-scan-feed/${scanId}`)
  }

  if (userProfileLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!userSummary) {
    return (
      <EmptyState
        title="User not found"
        description="This user profile may have been removed."
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
            <MyLocationIcon size={18} />
          </Box>
          <Box>
            <Typography variant="h1">{userSummary.userName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {userSummary.userId} · {userSummary.role}
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
        <SectionCard title="User Summary">
          <DetailFieldGrid
            fields={[
              { label: 'User ID', value: userSummary.userId },
              { label: 'User Name', value: userSummary.userName },
              { label: 'Role', value: userSummary.role },
              { label: 'Contact Number', value: userSummary.contactNumber },
              { label: 'Email Address', value: userSummary.email },
              { label: 'City', value: userSummary.city },
              { label: 'Address', value: userSummary.address },
              { label: 'Zone', value: userSummary.zone },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Scans"
              value={userSummary.totalScans}
              icon={<QrCodeScannerIcon size={20} />}
              iconColor="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Successful Scans"
              value={userSummary.successfulScans}
              icon={<CheckCircleOutlined size={20} />}
              iconColor="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Failed Scans"
              value={userSummary.failedScans}
              icon={<CancelOutlined size={20} />}
              iconColor="error"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Points Earned"
              value={userSummary.totalPointsEarned.toLocaleString('en-IN')}
              icon={<MyLocationIcon size={20} />}
              iconColor="secondary"
            />
          </Grid>
        </Grid>

        <SectionCard title="User Information">
          <DetailFieldGrid
            fields={[
              { label: 'Last Scan Date & Time', value: userSummary.lastScanDateTime },
              { label: 'Registered Location', value: userSummary.address },
              { label: 'Assigned Region', value: userSummary.zone },
              {
                label: 'Business Name',
                value: (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {userSummary.businessNames.map((name) => (
                      <Chip key={name} label={name} size="small" variant="outlined" />
                    ))}
                  </Stack>
                ),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Scan History">
          <CommonTable
            tableKey="live-scan-user-history"
            columns={[
              { key: 'scanDateTime', header: 'Scan Date & Time', sortable: true, render: (row) => row.scanDateTime },
              {
                key: 'scanCode',
                header: 'Scan Code',
                render: (row) => (
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() => openScan(row.id)}
                  >
                    {row.scanCode}
                  </Typography>
                ),
              },
              { key: 'productName', header: 'Product Name', render: (row) => row.productName },
              { key: 'productCode', header: 'Product Code', render: (row) => row.productCode },
              { key: 'batchNumber', header: 'Batch Number', render: (row) => row.batchNumber },
              { key: 'region', header: 'Region', render: (row) => row.region },
              { key: 'sourceIp', header: 'Source IP Address', render: (row) => row.technical.sourceIp },
              {
                key: 'result',
                header: 'Scan Result',
                sortable: true,
                sortValue: (row) => SCAN_RESULT_CONFIG[row.result].label,
                render: (row) => <ScanResultChip result={row.result} />,
              },
            ]}
            rows={userScanHistory}
            loading={userProfileLoading}
            getRowId={(row) => row.id}
            onRowClick={(row) => openScan(row.id)}
            searchPlaceholder="Search scans…"
            searchKeys={(row) => `${row.scanCode} ${row.productName} ${row.productCode}`}
            defaultSortBy="scanDateTime"
            emptyTitle="No scans recorded"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
