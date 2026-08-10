import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Stack, Typography, Button } from '@mui/material'
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
import { useScanFeed } from '@/features/fieldOperations/hooks/useScanFeed'

export function ScanUserProfilePage() {
  const navigate = useNavigate()
  const { userId: partnerId } = useParams<{ userId: string }>()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { scanEvents, totalItems, isLoading } = useScanFeed({
    partnerId,
    page: page + 1,
    limit: rowsPerPage,
  })

  const openScan = (scanId: string) => {
    navigate(`/field-operations/live-scan-feed/${scanId}`)
  }

  if (isLoading && scanEvents.length === 0) {
    return <DetailsPageSkeleton sections={4} />
  }

  const latestScan = scanEvents[0]

  if (!latestScan) {
    return (
      <EmptyState
        title="User not found"
        description="This user's scan history could not be found."
        actionLabel="Back to Live Scan Feed"
        onAction={() => navigate('/field-operations/live-scan-feed')}
      />
    )
  }

  const successfulScans = scanEvents.filter((s) => s.scanStatus === 'success').length
  const failedScans = scanEvents.filter((s) => s.scanStatus === 'failed').length
  const totalPointsEarned = scanEvents.reduce((sum, s) => sum + s.rewardPointsEarned, 0)

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
            <MyLocationIcon size={18} />
          </Box>
          <Box>
            <Typography variant="h1">{latestScan.businessDetails.partnerName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {partnerId} · {latestScan.partnerType}
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
              { label: 'Partner ID', value: partnerId ?? '-' },
              { label: 'Partner Name', value: latestScan.businessDetails.partnerName },
              { label: 'Partner Type', value: latestScan.partnerType },
              { label: 'Business Name', value: latestScan.businessDetails.businessName },
              { label: 'Outlet Name', value: latestScan.businessDetails.outletName },
              { label: 'Region', value: latestScan.region },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Scans"
              value={totalItems}
              icon={<QrCodeScannerIcon size={20} />}
              iconColor="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Successful Scans"
              value={successfulScans}
              icon={<CheckCircleOutlined size={20} />}
              iconColor="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Failed Scans"
              value={failedScans}
              icon={<CancelOutlined size={20} />}
              iconColor="error"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Points Earned"
              value={totalPointsEarned.toLocaleString('en-IN')}
              icon={<MyLocationIcon size={20} />}
              iconColor="secondary"
            />
          </Grid>
        </Grid>

        <SectionCard title="Scan History">
          <CommonTable
            tableKey="live-scan-user-history"
            columns={[
              {
                key: 'scannedAt',
                header: 'Scan Date & Time',
                sortable: true,
                render: (row) =>
                  new Date(row.scannedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
              },
              {
                key: 'scannedCode',
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
                    {row.scannedCode}
                  </Typography>
                ),
              },
              {
                key: 'productCode',
                header: 'Product Code',
                render: (row) => row.productDetails.productCode,
              },
              { key: 'batchNo', header: 'Batch Number', render: (row) => row.batchNo },
              { key: 'region', header: 'Region', render: (row) => row.region },
              {
                key: 'scanResult',
                header: 'Scan Result',
                sortable: true,
                render: (row) => <ScanResultChip status={row.scanStatus} label={row.scanResult} />,
              },
            ]}
            rows={scanEvents}
            loading={isLoading}
            getRowId={(row) => row.id}
            onRowClick={(row) => openScan(row.id)}
            totalCount={totalItems}
            page={page}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(next) => {
              setRowsPerPage(next)
              setPage(0)
            }}
            searchPlaceholder="Search scans…"
            searchKeys={(row) => `${row.scannedCode} ${row.productDetails.productCode}`}
            defaultSortBy="scannedAt"
            defaultSortDir="desc"
            emptyTitle="No scans recorded"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
