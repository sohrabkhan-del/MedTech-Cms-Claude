import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Grid, Stack, Typography } from '@mui/material'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import EditOutlined from '@mui/icons-material/EditOutlined'
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import BlockOutlined from '@mui/icons-material/BlockOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import FactoryOutlined from '@mui/icons-material/FactoryOutlined'
import QrCode2Outlined from '@mui/icons-material/QrCode2Outlined'
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { ImageGallery } from '@/components/common/ImageGallery/ImageGallery'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getProductById } from '@/features/inventory/mockProducts'
import type { ProductAuditEntry, ProductMovementEntry } from '@/types/product'

const movementColumns: CommonTableColumn<ProductMovementEntry>[] = [
  { key: 'factoryUploadBatch', header: 'Factory Upload Batch', sortable: true, render: (row) => row.factoryUploadBatch },
  { key: 'containerNumber', header: 'Container Number', render: (row) => row.containerNumber },
  {
    key: 'quantityUploaded',
    header: 'Quantity Uploaded',
    align: 'right',
    sortable: true,
    sortValue: (row) => row.quantityUploaded,
    render: (row) => row.quantityUploaded.toLocaleString('en-IN'),
  },
  { key: 'assignedDealer', header: 'Assigned Dealer', render: (row) => row.assignedDealer },
  { key: 'assignedChemist', header: 'Assigned Chemist', render: (row) => row.assignedChemist },
  { key: 'scanCount', header: 'Scan Count', align: 'right', sortable: true, sortValue: (row) => row.scanCount, render: (row) => row.scanCount.toLocaleString('en-IN') },
  { key: 'currentStatus', header: 'Current Product Status', render: (row) => <StatusBadge status={row.currentStatus} /> },
]

const auditColumns: CommonTableColumn<ProductAuditEntry>[] = [
  { key: 'action', header: 'Action Performed', render: (row) => row.action },
  { key: 'performedBy', header: 'Modified By', render: (row) => row.performedBy },
  { key: 'date', header: 'Date & Time', sortable: true, render: (row) => row.date },
  { key: 'previousValue', header: 'Previous Value', render: (row) => row.previousValue },
  { key: 'updatedValue', header: 'Updated Value', render: (row) => row.updatedValue },
]

export function ProductDetailsPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const product = productId ? getProductById(productId) : undefined

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been removed."
        actionLabel="Back to Product Master"
        onAction={() => navigate('/inventory/product-master')}
      />
    )
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar
            src={product.productImages[0]}
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <Inventory2Icon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h1">{product.productName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {product.productCode} · {product.productCategory}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<EditOutlined fontSize="small" />}
            onClick={() => navigate(`/inventory/product-master/${product.id}/edit`)}
            sx={{ fontSize: '0.75rem' }}
          >
            Edit Product
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyOutlined fontSize="small" />}
            onClick={() => navigate(`/inventory/product-master/new?cloneFrom=${product.id}`)}
            sx={{ fontSize: '0.75rem' }}
          >
            Clone
          </Button>
          {product.status === 'active' ? (
            <Button variant="outlined" color="error" startIcon={<BlockOutlined fontSize="small" />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
              Deactivate
            </Button>
          ) : (
            <Button variant="outlined" color="success" startIcon={<CheckCircleOutlined fontSize="small" />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
              Activate
            </Button>
          )}
          <Button variant="outlined" color="error" startIcon={<DeleteOutlined fontSize="small" />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Product Code', value: product.productCode },
              { label: 'Product Name', value: product.productName },
              { label: 'Product Category', value: product.productCategory },
              { label: 'Status', value: <StatusBadge status={product.status} /> },
              { label: 'Dealer Reward Points', value: product.dealerRewardPoints },
              { label: 'Chemist Reward Points', value: product.chemistRewardPoints },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Factory Uploads" value={product.totalFactoryUploads} icon={<FactoryOutlined fontSize="small" />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total QR Codes Generated" value={product.totalQrCodesGenerated.toLocaleString('en-IN')} icon={<QrCode2Outlined fontSize="small" />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Successful Scans" value={product.totalSuccessfulScans.toLocaleString('en-IN')} icon={<CheckCircleOutlined fontSize="small" />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Reward Points Issued" value={product.totalRewardPointsIssued.toLocaleString('en-IN')} icon={<EmojiEventsOutlined fontSize="small" />} iconColor="warning" />
          </Grid>
        </Grid>

        <SectionCard title="Product Images & Information">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ImageGallery images={product.productImages} alt={product.productName} height={280} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5} sx={{ height: '100%' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Description
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', mt: 0.5, lineHeight: 1.6 }}>{product.description}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Manufacturing Details
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', mt: 0.5, lineHeight: 1.6 }}>{product.manufacturingDetails}</Typography>
                </Box>
                <Box sx={{ pt: 1.5, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
                  <DetailFieldGrid
                    fields={[
                      { label: 'SKU', value: product.sku },
                      { label: 'Brand', value: product.brand },
                      { label: 'MRP', value: `₹${product.mrp.toLocaleString('en-IN')}` },
                      { label: 'Product Status', value: <StatusBadge status={product.status} /> },
                      { label: 'Created Date', value: product.createdDate },
                      { label: 'Last Updated Date', value: product.lastUpdatedDate },
                    ]}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Reward Configuration">
          <DetailFieldGrid
            fields={[
              { label: 'Dealer Reward Points', value: product.dealerRewardPoints },
              { label: 'Chemist Reward Points', value: product.chemistRewardPoints },
              { label: 'Reward Configuration Status', value: product.rewardConfigStatus === 'configured' ? 'Configured' : 'Pending' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Product Usage Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Total Factory Uploads', value: product.totalFactoryUploads },
              { label: 'Total QR Codes Generated', value: product.totalQrCodesGenerated.toLocaleString('en-IN') },
              { label: 'Total Successful Scans', value: product.totalSuccessfulScans.toLocaleString('en-IN') },
              { label: 'Total Dealer Allocations', value: product.totalDealerAllocations },
              { label: 'Total Chemist Allocations', value: product.totalChemistAllocations },
              { label: 'Total Reward Points Issued', value: product.totalRewardPointsIssued.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>

        <SectionCard title="Product Movement History">
          <CommonTable
            tableKey="product-movement-history"
            columns={movementColumns}
            rows={product.movementHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search movement history…"
            searchKeys={(row) => `${row.factoryUploadBatch} ${row.containerNumber} ${row.assignedDealer} ${row.assignedChemist}`}
            emptyTitle="No movement history yet"
          />
        </SectionCard>

        <SectionCard title="Related Information">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EmptyState title="No active schemes" description="This will populate once the Scheme Management module is available." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EmptyState title="No coin value rules linked" description="This will populate once the Coin Value Rules module is available." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EmptyState title="No factory upload history" description="This will populate once Factory Inventory Upload is wired to this product." />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EmptyState title="No interested users" description="This will populate once the Interested Users module is available." />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Timeline">
          <ActivityTimeline entries={product.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Audit History">
          <CommonTable
            tableKey="product-audit-history"
            columns={auditColumns}
            rows={product.auditHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search audit history…"
            searchKeys={(row) => `${row.action} ${row.performedBy}`}
            defaultSortBy="date"
            emptyTitle="No audit records yet"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
