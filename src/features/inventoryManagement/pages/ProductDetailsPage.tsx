import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material'
import { Package as Inventory2Icon } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useProductDetail } from '@/features/inventoryManagement/hooks/useProductDetail'
import type {
  ProductMovementEntry,
  ProductRegionConfig,
} from '@/features/inventoryManagement/types/inventoryManagement.types'

const regionColumns: CommonTableColumn<ProductRegionConfig>[] = [
  {
    key: 'regionName',
    header: 'Region',
    sortable: true,
    render: (row) => row.regionName,
  },
  {
    key: 'dealerMultiplier',
    header: 'Dealer Multiplier',
    align: 'center',
    render: (row) => row.dealerMultiplier ?? '-',
  },
  {
    key: 'chemistMultiplier',
    header: 'Chemist Multiplier',
    align: 'center',
    render: (row) => row.chemistMultiplier ?? '-',
  },
]

const movementColumns: CommonTableColumn<ProductMovementEntry>[] = [
  {
    key: 'factoryUploadBatch',
    header: 'Batch Number',
    sortable: true,
    render: (row) => row.factoryUploadBatch,
  },
  {
    key: 'quantityUploaded',
    header: 'Quantity',
    align: 'center',
    sortable: true,
    sortValue: (row) => row.quantityUploaded,
    render: (row) => row.quantityUploaded.toLocaleString('en-IN'),
  },
  {
    key: 'startSerialNo',
    header: 'Start Serial No',
    render: (row) => row.startSerialNo,
  },
  {
    key: 'endSerialNo',
    header: 'End Serial No',
    render: (row) => row.endSerialNo,
  },
  {
    key: 'containerStartSerialNo',
    header: 'Container Start Serial No',
    render: (row) => row.containerStartSerialNo,
  },
  {
    key: 'containerEndSerialNo',
    header: 'Container End Serial No',
    render: (row) => row.containerEndSerialNo,
  },
  {
    key: 'scannedStatus',
    header: 'Scanned Status',
    sortable: true,
    sortValue: (row) => row.scannedStatus,
    render: (row) =>
      row.scannedStatus === 'completed' ? 'Completed' : 'Pending',
  },
]

export function ProductDetailsPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const { product, isLoading } = useProductDetail(productId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={6} />
  }

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
            <Inventory2Icon size={20} />
          </Avatar>
          <Box>
            <Typography variant="h1">{product.productName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {product.productCode} · {product.productCategory}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Product Code', value: product.productCode },
              { label: 'Product Name', value: product.productName || '-' },
              {
                label: 'Product Category',
                value: product.category?.categoryName || '-',
              },
              {
                label: 'Category Code',
                value: product.category?.categoryCode || '-',
              },
              {
                label: 'Status',
                value: <StatusBadge status={product.status} />,
              },
              {
                label: 'Dealer Container Points',
                value: product.dealerContainerPoints,
              },
              {
                label: 'Dealer Product Points',
                value: product.dealerProductPoints,
              },
              {
                label: 'Chemist Container Points',
                value: product.chemistContainerPoints,
              },
              {
                label: 'Chemist Product Points',
                value: product.chemistProductPoints,
              },
              {
                label: 'Reward Configuration Status',
                value:
                  product.rewardConfigStatus === 'configured'
                    ? 'Configured'
                    : 'Pending',
              },
              { label: 'Created On', value: product.createdDate },
              { label: 'Last Updated', value: product.lastUpdatedDate },
            ]}
          />
        </SectionCard>

        <SectionCard
          title="Product Movement History"
          action={<Chip label="Sample data" size="small" variant="outlined" />}
        >
          <CommonTable
            tableKey="product-movement-history"
            columns={movementColumns}
            rows={product.movementHistory}
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search movement history…"
            searchKeys={(row) =>
              `${row.factoryUploadBatch} ${row.startSerialNo} ${row.endSerialNo}`
            }
            emptyTitle="No movement history yet"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
