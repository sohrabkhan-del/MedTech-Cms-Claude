import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import {
  Gift as GiftIcon,
  ArrowLeft as ArrowBackOutlined,
  Pencil,
  PackagePlus,
  CircleCheck,
  Ban,
  Trash2,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ImageGallery } from '@/components/common/ImageGallery/ImageGallery'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useGiftDetail } from '@/features/schemeManagement/hooks/useGiftDetail'
import { giftsService } from '@/features/schemeManagement/services/giftsService'
import type {
  GiftDeliveryStatus,
  GiftInventoryEntry,
  GiftRedemptionEntry,
} from '@/features/schemeManagement/types/schemeManagement.types'

const deliveryStatusConfig: Record<
  GiftDeliveryStatus,
  { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }
> = {
  pending: { label: 'Pending', color: 'default' },
  packed: { label: 'Packed', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
}

const stockStatusLabel = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
} as const

const redemptionColumns: CommonTableColumn<GiftRedemptionEntry>[] = [
  {
    key: 'id',
    header: 'Redemption ID',
    minWidth: 140,
    render: (row) => row.id,
  },
  {
    key: 'userName',
    header: 'User',
    minWidth: 160,
    sortable: true,
    sortValue: (row) => row.userName,
    render: (row) => row.userName,
  },
  {
    key: 'userType',
    header: 'User Type',
    minWidth: 100,
    render: (row) => row.userType,
  },
  {
    key: 'coinsUsed',
    header: 'Coins Used',
    align: 'center',
    sortable: true,
    sortValue: (row) => row.coinsUsed,
    render: (row) => row.coinsUsed.toLocaleString('en-IN'),
  },
  {
    key: 'redemptionDate',
    header: 'Redemption Date',
    minWidth: 140,
    sortable: true,
    render: (row) => row.redemptionDate,
  },
  {
    key: 'deliveryStatus',
    header: 'Delivery Status',
    minWidth: 130,
    render: (row) => (
      <Chip
        size="small"
        label={deliveryStatusConfig[row.deliveryStatus].label}
        color={deliveryStatusConfig[row.deliveryStatus].color}
      />
    ),
  },
]

const inventoryColumns: CommonTableColumn<GiftInventoryEntry>[] = [
  { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
  {
    key: 'stockAdded',
    header: 'Stock Added',
    align: 'center',
    render: (row) => row.stockAdded.toLocaleString('en-IN'),
  },
  {
    key: 'stockRemoved',
    header: 'Stock Removed',
    align: 'center',
    render: (row) => row.stockRemoved.toLocaleString('en-IN'),
  },
  {
    key: 'currentStock',
    header: 'Current Stock',
    align: 'center',
    render: (row) => row.currentStock.toLocaleString('en-IN'),
  },
  { key: 'updatedBy', header: 'Updated By', render: (row) => row.updatedBy },
]

export function GiftDetailsPage() {
  const navigate = useNavigate()
  const { giftId } = useParams<{ giftId: string }>()
  const { gift, setStatus, remove, isLoading } = useGiftDetail(giftId)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!gift) {
    return (
      <EmptyState
        title="Gift not found"
        description="This gift may have been removed."
        actionLabel="Back to Gift Catalogue"
        onAction={() => navigate('/scheme-management/gift-catalogue')}
      />
    )
  }

  const stockStatus = giftsService.getStockStatus(gift)
  const remainingStock = gift.availableQuantity

  const confirmDelete = () => {
    remove()
    setDeleteOpen(false)
    navigate('/scheme-management/gift-catalogue')
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
            <GiftIcon size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{gift.giftName}</Typography>
              <Chip
                size="small"
                label={gift.status === 'active' ? 'Active' : 'Inactive'}
                color={gift.status === 'active' ? 'success' : 'default'}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {gift.giftCode} · {gift.category}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Pencil size={20} />}
            onClick={() =>
              navigate(`/scheme-management/gift-catalogue/${gift.id}/edit`)
            }
            sx={{ fontSize: '0.75rem' }}
          >
            Edit Gift
          </Button>
          <Button
            variant="outlined"
            startIcon={<PackagePlus size={20} />}
            onClick={() => {}}
            sx={{ fontSize: '0.75rem' }}
          >
            Update Stock
          </Button>
          {gift.status === 'active' ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Ban size={20} />}
              onClick={() => setStatus('inactive')}
              sx={{ fontSize: '0.75rem' }}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="success"
              startIcon={<CircleCheck size={20} />}
              onClick={() => setStatus('active')}
              sx={{ fontSize: '0.75rem' }}
            >
              Activate
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={20} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ fontSize: '0.75rem' }}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlined size={20} />}
            onClick={() => navigate('/scheme-management/gift-catalogue')}
            sx={{ fontSize: '0.75rem' }}
          >
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Gift Code', value: gift.giftCode },
              { label: 'Gift Name', value: gift.giftName },
              { label: 'Category', value: gift.category },
              { label: 'Brand', value: gift.brand },
              {
                label: 'Price (₹)',
                value: `₹${gift.price.toLocaleString('en-IN')}`,
              },
              {
                label: 'Required Coins',
                value: gift.requiredCoins.toLocaleString('en-IN'),
              },
              {
                label: 'Current Status',
                value: (
                  <Chip
                    size="small"
                    label={gift.status === 'active' ? 'Active' : 'Inactive'}
                    color={gift.status === 'active' ? 'success' : 'default'}
                  />
                ),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Product Information">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ImageGallery
                images={gift.giftImage ? [gift.giftImage] : []}
                alt={gift.giftName}
                height={260}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5} sx={{ height: '100%' }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Description
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.8125rem', mt: 0.5, lineHeight: 1.6 }}
                  >
                    {gift.description}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    pt: 1.5,
                    mt: 'auto',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <DetailFieldGrid
                    fields={[
                      { label: 'Brand', value: gift.brand },
                      { label: 'SKU', value: gift.sku },
                      {
                        label: 'Price (₹)',
                        value: `₹${gift.price.toLocaleString('en-IN')}`,
                      },
                      {
                        label: 'Coin Value',
                        value: gift.requiredCoins.toLocaleString('en-IN'),
                      },
                      {
                        label: 'Available Quantity',
                        value: gift.availableQuantity.toLocaleString('en-IN'),
                      },
                      {
                        label: 'Redeemed Quantity',
                        value: gift.redeemedQuantity.toLocaleString('en-IN'),
                      },
                      {
                        label: 'Remaining Stock',
                        value: `${remainingStock.toLocaleString('en-IN')} (${stockStatusLabel[stockStatus]})`,
                      },
                    ]}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Redemption History">
          <CommonTable
            tableKey="gift-redemption-history"
            columns={redemptionColumns}
            rows={gift.redemptionHistory}
            getRowId={(row) => row.id}
            loading={isLoading}
            searchPlaceholder="Search redemption history…"
            searchKeys={(row) => `${row.userName} ${row.id}`}
            defaultSortBy="redemptionDate"
            defaultSortDir="desc"
            emptyTitle="No redemptions yet"
          />
        </SectionCard>

        <SectionCard title="Inventory History">
          <CommonTable
            tableKey="gift-inventory-history"
            columns={inventoryColumns}
            rows={gift.inventoryHistory}
            getRowId={(row) => row.id}
            loading={isLoading}
            searchPlaceholder="Search inventory history…"
            searchKeys={(row) => row.updatedBy}
            defaultSortBy="date"
            emptyTitle="No inventory records yet"
          />
        </SectionCard>
      </Stack>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Gift"
        description={`Are you sure you want to permanently delete "${gift.giftName}"? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={confirmDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {gift.giftCode} · {gift.giftName}
        </Typography>
      </Modal>
    </>
  )
}
