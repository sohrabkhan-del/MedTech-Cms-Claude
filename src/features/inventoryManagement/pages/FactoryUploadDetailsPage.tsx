import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import {
  Factory as FactoryOutlined,
  Trash2 as DeleteOutlined,
  Package as Inventory2Outlined,
  CircleCheck as CheckCircleOutlined,
  Ban as BlockOutlined,
  Hourglass as HourglassEmptyOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useFactoryBatchDetail } from '@/features/inventoryManagement/hooks/useFactoryBatchDetail'
import type { BatchContainer } from '@/features/inventoryManagement/types/inventoryManagement.types'

export function FactoryUploadDetailsPage() {
  const navigate = useNavigate()
  const { batchId } = useParams<{ batchId: string }>()
  const { batch } = useFactoryBatchDetail(batchId)

  if (!batch) {
    return (
      <EmptyState
        title="Batch not found"
        description="This factory upload batch may have been removed."
        actionLabel="Back to Factory Inventory Upload"
        onAction={() => navigate('/inventory/factory-inventory-upload')}
      />
    )
  }

  const containerColumns: CommonTableColumn<BatchContainer>[] = [
    {
      key: 'containerNumber',
      header: 'Container Number',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.containerNumber,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/inventory/factory-inventory-upload/${batch.id}/${row.id}`)}
        >
          {row.containerNumber}
        </Typography>
      ),
    },
    { key: 'boxCount', header: 'Boxes', align: 'center', render: (row) => row.boxCount },
    { key: 'productCount', header: 'Products', align: 'right', render: (row) => row.productCount.toLocaleString('en-IN') },
    { key: 'status', header: 'Status', render: (row) => row.status },
  ]

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
            <FactoryOutlined size={20} />
          </Box>
          <Box>
            <Typography variant="h1">{batch.batchName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {batch.batchNumber} · {batch.batchDate}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="error" startIcon={<DeleteOutlined size={20} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Upload ID', value: batch.uploadId },
              { label: 'Production Plan Number', value: batch.productionPlanNumber },
              { label: 'Batch Number', value: batch.batchNumber },
              { label: 'Product Name', value: batch.productName },
              { label: 'Product Code', value: batch.productCode },
              { label: 'Batch Date', value: batch.batchDate },
              { label: 'Batch Completion Date', value: batch.batchCompletionDate },
              { label: 'Assembly Line', value: batch.assemblyLine },
              { label: 'Export Type', value: batch.exportType },
              { label: 'Plug Type', value: batch.plugType },
              { label: 'Issued By', value: batch.issuedBy },
              { label: 'Month', value: batch.month },
              { label: 'Total Containers', value: batch.totalContainers },
              { label: 'Retention Sample Quantity', value: batch.retentionSampleQuantity },
              { label: 'Remarks', value: batch.remarks },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Containers" value={batch.totalContainers} icon={<Inventory2Outlined size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Products" value={batch.totalProducts.toLocaleString('en-IN')} icon={<FactoryOutlined size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Accepted" value={batch.totalAccepted.toLocaleString('en-IN')} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Rejected" value={batch.totalRejected} icon={<BlockOutlined size={20} />} iconColor="error" />
          </Grid>
        </Grid>

        <SectionCard title="Batch Information">
          <DetailFieldGrid
            fields={[
              { label: 'Barcode Range Start', value: batch.barcodeRangeStart },
              { label: 'Barcode Range End', value: batch.barcodeRangeEnd },
              { label: 'Processing Summary', value: batch.processingSummary },
              { label: 'Month', value: batch.month },
              { label: 'Retention Quantity', value: batch.retentionSampleQuantity },
              { label: 'Accepted Products', value: batch.acceptedProducts.toLocaleString('en-IN') },
              { label: 'Rejected Products', value: batch.rejectedProducts },
              { label: 'Pending Products', value: batch.pendingProducts.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>

        <SectionCard title="Containers">
          <CommonTable
            tableKey="factory-batch-containers"
            columns={containerColumns}
            rows={batch.containers}
            getRowId={(row) => row.id}
            searchPlaceholder="Search containers…"
            searchKeys={(row) => row.containerNumber}
            actions={[
              { label: 'View Container', onClick: (row) => navigate(`/inventory/factory-inventory-upload/${batch.id}/${row.id}`) },
            ]}
            emptyTitle="No containers yet"
          />
        </SectionCard>

        <SectionCard title="Traceability Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Total Products Manufactured', value: batch.totalProducts.toLocaleString('en-IN') },
              { label: 'Assigned to Dealers', value: batch.totalAssignedToDealers.toLocaleString('en-IN') },
              { label: 'Assigned to Chemists', value: batch.totalAssignedToChemists.toLocaleString('en-IN') },
              { label: 'Scanned', value: batch.totalScanned.toLocaleString('en-IN') },
              { label: 'Pending Allocation', value: batch.totalPendingAllocation.toLocaleString('en-IN') },
              { label: 'Duplicate Scan Attempts', value: batch.duplicateScanAttempts },
              { label: 'Rewards Issued', value: batch.totalRewardsIssued.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>

        {batch.pendingProducts > 0 && (
          <SectionCard title="Pending Allocation">
            <EmptyState
              title="Some products are awaiting allocation"
              description={`${batch.totalPendingAllocation.toLocaleString('en-IN')} products have not yet been assigned to a dealer.`}
              icon={<HourglassEmptyOutlined size={35} />}
            />
          </SectionCard>
        )}

        <SectionCard title="Timeline">
          <ActivityTimeline entries={batch.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>
      </Stack>
    </>
  )
}
