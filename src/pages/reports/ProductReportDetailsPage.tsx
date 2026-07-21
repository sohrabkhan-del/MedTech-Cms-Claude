import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import {
  BarChart3,
  ArrowLeft as ArrowBackOutlined,
  ScanLine,
  Trophy,
  Factory as FactoryOutlined,
  QrCode as QrCode2Outlined,
  Gauge,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getProductReportById } from '@/features/reports/mockProductReports'
import type { ProductMovementEntry } from '@/types/product'

const scanHistoryColumns: CommonTableColumn<ProductMovementEntry>[] = [
  { key: 'factoryUploadBatch', header: 'Batch Number', sortable: true, render: (row) => row.factoryUploadBatch },
  {
    key: 'quantityUploaded',
    header: 'Quantity',
    align: 'right',
    sortable: true,
    sortValue: (row) => row.quantityUploaded,
    render: (row) => row.quantityUploaded.toLocaleString('en-IN'),
  },
  { key: 'startSerialNo', header: 'Start Serial No', render: (row) => row.startSerialNo },
  { key: 'endSerialNo', header: 'End Serial No', render: (row) => row.endSerialNo },
  {
    key: 'scannedStatus',
    header: 'Scanned Status',
    render: (row) => (row.scannedStatus === 'completed' ? 'Completed' : 'Pending'),
  },
]

export function ProductReportDetailsPage() {
  const navigate = useNavigate()
  const { productReportId } = useParams<{ productReportId: string }>()
  const report = productReportId ? getProductReportById(productReportId) : undefined

  if (!report) {
    return (
      <EmptyState
        title="Product report not found"
        description="This product report may have been removed."
        actionLabel="Back to Product Reports"
        onAction={() => navigate('/reports/product-reports-1')}
      />
    )
  }

  const avgRewardPerScan = report.totalScans > 0 ? (report.rewardPoints / report.totalScans).toFixed(2) : '0'
  const scanConversionRate = report.totalQrCodesGenerated > 0 ? ((report.totalScans / report.totalQrCodesGenerated) * 100).toFixed(1) : '0'

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
            <BarChart3 size={18} />
          </Box>
          <Box>
            <Typography variant="h1">{report.productName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {report.productCode} · {report.productCategory}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={20} />} onClick={() => navigate('/reports/product-reports-1')} sx={{ fontSize: '0.75rem' }}>
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Product Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Product Code', value: report.productCode },
              { label: 'Product Name', value: report.productName },
              { label: 'Category', value: report.productCategory },
              { label: 'Brand', value: report.brand },
              { label: 'SKU', value: report.sku },
              { label: 'MRP', value: `₹${report.mrp.toLocaleString('en-IN')}` },
              { label: 'Status', value: <StatusBadge status={report.status} /> },
              { label: 'Uploaded Date', value: report.uploadedDate },
            ]}
          />
        </SectionCard>

        <SectionCard title="Batch Information">
          <DetailFieldGrid
            fields={[
              { label: 'Representative Batch', value: report.batch },
              { label: 'Total Factory Uploads', value: report.totalFactoryUploads },
              { label: 'Total QR Codes Generated', value: report.totalQrCodesGenerated.toLocaleString('en-IN') },
              { label: 'Total Batches in Movement History', value: report.movementHistory.length },
            ]}
          />
        </SectionCard>

        <SectionCard title="Scan History">
          <CommonTable
            tableKey="product-report-scan-history"
            columns={scanHistoryColumns}
            rows={report.movementHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search scan history…"
            searchKeys={(row) => `${row.factoryUploadBatch} ${row.startSerialNo} ${row.endSerialNo}`}
            defaultSortBy="quantityUploaded"
            defaultSortDir="desc"
            emptyTitle="No scan history yet"
          />
        </SectionCard>

        <SectionCard title="Reward Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Dealer Reward Points', value: report.dealerRewardPoints },
              { label: 'Chemist Reward Points', value: report.chemistRewardPoints },
              { label: 'Total Reward Points Issued', value: report.rewardPoints.toLocaleString('en-IN') },
              { label: 'Average Reward per Scan', value: avgRewardPerScan },
            ]}
          />
        </SectionCard>

        <SectionCard title="Distribution Journey">
          <DetailFieldGrid
            fields={[
              { label: 'Total Factory Uploads', value: report.totalFactoryUploads },
              { label: 'Total Dealer Allocations', value: report.totalDealerAllocations },
              { label: 'Total Chemist Allocations', value: report.totalChemistAllocations },
              { label: 'Total Successful Scans', value: report.totalScans.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>

        <SectionCard title="Performance Analytics">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Total Scans" value={report.totalScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Reward Points Issued" value={report.rewardPoints.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="QR Codes Generated" value={report.totalQrCodesGenerated.toLocaleString('en-IN')} icon={<QrCode2Outlined size={20} />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Scan Conversion Rate" value={`${scanConversionRate}%`} icon={<Gauge size={20} />} iconColor="success" />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Factory & Allocation Overview">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Total Factory Uploads" value={report.totalFactoryUploads} icon={<FactoryOutlined size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Dealer Allocations" value={report.totalDealerAllocations} icon={<ScanLine size={20} />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Chemist Allocations" value={report.totalChemistAllocations} icon={<ScanLine size={20} />} iconColor="info" />
            </Grid>
          </Grid>
        </SectionCard>
      </Stack>
    </>
  )
}
