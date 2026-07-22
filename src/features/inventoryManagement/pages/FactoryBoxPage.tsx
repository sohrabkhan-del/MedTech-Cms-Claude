import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Breadcrumbs, Chip, Link as MuiLink, Stack, Typography } from '@mui/material'
import { Box as ViewInArOutlined, ChevronRight as NavigateNextOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { ProductTraceabilityModal } from '@/components/inventory/ProductTraceabilityModal'
import { useBoxDetail } from '@/features/inventoryManagement/hooks/useBoxDetail'
import type { BoxProduct, ProductTraceabilityStatus, FactoryScanStatus } from '@/features/inventoryManagement/types/inventoryManagement.types'

const traceabilityStatusConfig: Record<ProductTraceabilityStatus, { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  manufactured: { label: 'Manufactured', color: 'default' },
  dealer_assigned: { label: 'Dealer Assigned', color: 'info' },
  chemist_assigned: { label: 'Chemist Assigned', color: 'info' },
  scanned: { label: 'Scanned', color: 'success' },
  redeemed: { label: 'Redeemed', color: 'success' },
}

const scanStatusConfig: Record<FactoryScanStatus, { label: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
  scanned: { label: 'Scanned', color: 'success' },
  not_scanned: { label: 'Not Scanned', color: 'default' },
  duplicate_attempt: { label: 'Duplicate Attempt', color: 'error' },
}

export function FactoryBoxPage() {
  const navigate = useNavigate()
  const { batchId, containerId, boxId } = useParams<{ batchId: string; containerId: string; boxId: string }>()
  const { batch, container, box, isLoading } = useBoxDetail(batchId, containerId, boxId)

  const [selectedProduct, setSelectedProduct] = useState<BoxProduct | null>(null)

  if (!batch || !container || !box) {
    return (
      <EmptyState
        title="Box not found"
        description="This box may have been removed."
        actionLabel="Back to Factory Inventory Upload"
        onAction={() => navigate('/inventory/factory-inventory-upload')}
      />
    )
  }

  const columns: CommonTableColumn<BoxProduct>[] = [
    { key: 'containerNumber', header: 'Container Number', minWidth: 150, render: () => container.containerNumber },
    { key: 'boxNumber', header: 'Box Number', minWidth: 120, render: () => box.boxNumber },
    {
      key: 'serialNumber',
      header: 'Product Serial Number',
      minWidth: 150,
      sortable: true,
      sortValue: (row) => row.serialNumber,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => setSelectedProduct(row)}
        >
          {row.serialNumber}
        </Typography>
      ),
    },
    { key: 'barcodeNumber', header: 'Barcode Number', minWidth: 160, render: (row) => row.barcodeNumber },
    {
      key: 'productStatus',
      header: 'Product Status',
      minWidth: 140,
      render: (row) => <Chip size="small" label={traceabilityStatusConfig[row.productStatus].label} color={traceabilityStatusConfig[row.productStatus].color} />,
    },
    { key: 'allocatedDealer', header: 'Dealer Name', minWidth: 150, render: (row) => row.allocatedDealer },
    { key: 'dealerAllocationDate', header: 'Dealer Assigned Date', minWidth: 150, render: (row) => row.dealerAllocationDate },
    { key: 'allocatedChemist', header: 'Chemist Name', minWidth: 150, render: (row) => row.allocatedChemist },
    { key: 'chemistAllocationDate', header: 'Chemist Assigned Date', minWidth: 150, render: (row) => row.chemistAllocationDate },
    { key: 'currentHolder', header: 'Current Owner', minWidth: 150, render: (row) => row.currentHolder },
    { key: 'lastScanDate', header: 'Last Scan Date', minWidth: 130, render: (row) => row.lastScanDate },
    {
      key: 'scanStatus',
      header: 'Scan Status',
      minWidth: 140,
      render: (row) => <Chip size="small" label={scanStatusConfig[row.scanStatus].label} color={scanStatusConfig[row.scanStatus].color} />,
    },
    { key: 'redemptionStatus', header: 'Reward Status', minWidth: 130, render: (row) => row.redemptionStatus },
    {
      key: 'traceabilityStatus',
      header: 'Traceability Status',
      minWidth: 150,
      render: (row) => <Chip size="small" label={traceabilityStatusConfig[row.traceabilityStatus].label} color={traceabilityStatusConfig[row.traceabilityStatus].color} />,
    },
  ]

  return (
    <>
      <Breadcrumbs separator={<NavigateNextOutlined size={16} />} sx={{ mb: 1.5 }}>
        <MuiLink
          component="button"
          underline="hover"
          color="text.secondary"
          sx={{ fontSize: '0.8125rem' }}
          onClick={() => navigate(`/inventory/factory-inventory-upload/${batch.id}`)}
        >
          {batch.batchName}
        </MuiLink>
        <MuiLink
          component="button"
          underline="hover"
          color="text.secondary"
          sx={{ fontSize: '0.8125rem' }}
          onClick={() => navigate(`/inventory/factory-inventory-upload/${batch.id}/${container.id}`)}
        >
          {container.containerNumber}
        </MuiLink>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{box.boxNumber}</Typography>
      </Breadcrumbs>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
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
          <ViewInArOutlined size={20} />
        </Box>
        <Box>
          <Typography variant="h1">{box.boxNumber}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {batch.batchName} · {container.containerNumber}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Box Number', value: box.boxNumber },
              { label: 'Container Number', value: container.containerNumber },
              { label: 'Batch Name', value: batch.batchName },
              { label: 'Total Products', value: box.productCount },
              { label: 'Status', value: box.status },
            ]}
          />
        </SectionCard>

        <SectionCard title="Traceability Table">
          <CommonTable
            tableKey="factory-box-traceability"
            columns={columns}
            rows={box.products}
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search by serial or barcode…"
            searchKeys={(row) => `${row.serialNumber} ${row.barcodeNumber} ${row.allocatedDealer} ${row.allocatedChemist}`}
            actions={[{ label: 'View', onClick: (row) => setSelectedProduct(row) }]}
            emptyTitle="No products in this box"
          />
        </SectionCard>
      </Stack>

      <ProductTraceabilityModal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
    </>
  )
}
