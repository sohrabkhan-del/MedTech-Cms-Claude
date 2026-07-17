import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  ArrowLeft as ArrowBackOutlined,
  Megaphone,
  CircleCheck as CheckCircleOutlined,
  Eye,
  Trophy,
  Star,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { ImageGallery } from '@/components/common/ImageGallery/ImageGallery'
import { getShowcaseProductById } from '@/features/marketing/mockShowcaseProducts'
import type { DeliveryStatus, EnquiryStatus, ProductEnquiry, ShowcaseUserType } from '@/types/showcaseProduct'

const enquiryStatusConfig: Record<EnquiryStatus, { label: string; color: 'warning' | 'success' }> = {
  pending: { label: 'Pending', color: 'warning' },
  responded: { label: 'Responded', color: 'success' },
}

const deliveryStatusConfig: Record<DeliveryStatus, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Pending', color: 'default' },
  packed: { label: 'Packed', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  out_for_delivery: { label: 'Out for Delivery', color: 'warning' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
}

interface InterestedUserFilters extends Record<string, unknown> {
  enquiryStatus: EnquiryStatus | 'all'
  deliveryStatus: DeliveryStatus | 'all'
}

export function ProductCatalogDetailsPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const product = productId ? getShowcaseProductById(productId) : undefined

  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<InterestedUserFilters>({ enquiryStatus: 'all', deliveryStatus: 'all' })

  const filteredUsers = useMemo(
    () =>
      (product?.enquiries ?? []).filter((row) => {
        const enquiryMatch = appliedFilters.enquiryStatus === 'all' || row.enquiryStatus === appliedFilters.enquiryStatus
        const deliveryMatch = appliedFilters.deliveryStatus === 'all' || row.deliveryStatus === appliedFilters.deliveryStatus
        return enquiryMatch && deliveryMatch
      }),
    [product, appliedFilters],
  )

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This showcase product may have been removed."
        actionLabel="Back to Products Catalog"
        onAction={() => navigate('/marketing-products/products-catelog')}
      />
    )
  }

  const userColumns: CommonTableColumn<ProductEnquiry>[] = [
    { key: 'userName', header: 'User Name', minWidth: 150, sortable: true, sortValue: (row) => row.userName, render: (row) => row.userName },
    { key: 'userType', header: 'User Type', minWidth: 100, render: (row) => row.userType as ShowcaseUserType },
    { key: 'email', header: 'Email Address', minWidth: 190, render: (row) => row.email },
    { key: 'mobileNumber', header: 'Mobile Number', minWidth: 140, render: (row) => row.mobileNumber },
    { key: 'interestedDate', header: 'Interested Date', minWidth: 140, sortable: true, render: (row) => row.interestedDate },
    { key: 'enquiryStatus', header: 'Enquiry Status', minWidth: 130, render: (row) => <Chip size="small" label={enquiryStatusConfig[row.enquiryStatus].label} color={enquiryStatusConfig[row.enquiryStatus].color} /> },
    { key: 'deliveryStatus', header: 'Delivery Status', minWidth: 140, render: (row) => <Chip size="small" label={deliveryStatusConfig[row.deliveryStatus].label} color={deliveryStatusConfig[row.deliveryStatus].color} /> },
  ]

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar src={product.productImage} variant="rounded" sx={{ width: 36, height: 36, borderRadius: '10px' }}>
            <Megaphone size={18} />
          </Avatar>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{product.productName}</Typography>
              {product.featuredProduct && <Chip size="small" label="Featured" color="warning" icon={<Star size={14} />} />}
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {product.sku} · {product.category}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={() => navigate(`/marketing-products/products-catelog/${product.id}/edit`)} sx={{ fontSize: '0.75rem' }}>
            Edit Product
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={20} />} onClick={() => navigate('/marketing-products/products-catelog')} sx={{ fontSize: '0.75rem' }}>
            Back to Enquiries
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Product SKU', value: product.sku },
              { label: 'Product Name', value: product.productName },
              { label: 'Category', value: product.category },
              { label: 'Price (₹)', value: `₹${product.price.toLocaleString('en-IN')}` },
              { label: 'Status', value: <Chip size="small" label={product.status === 'active' ? 'Active' : 'Inactive'} color={product.status === 'active' ? 'success' : 'default'} /> },
              { label: 'Reward Points', value: product.rewardPoints },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Product Status" value={product.status === 'active' ? 'Active' : 'Inactive'} icon={<CheckCircleOutlined size={20} />} iconColor={product.status === 'active' ? 'success' : 'error'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Interested Users" value={product.totalInterestedUsers} icon={<Megaphone size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Product Views" value={product.totalProductViews.toLocaleString('en-IN')} icon={<Eye size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Reward Points Allocated" value={product.rewardPointsAllocated.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />
          </Grid>
        </Grid>

        <SectionCard title="Product Images & Information">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ImageGallery images={product.productImage ? [product.productImage] : []} alt={product.productName} height={280} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5} sx={{ height: '100%' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Description
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', mt: 0.5, lineHeight: 1.6 }}>{product.description}</Typography>
                </Box>
                <Box sx={{ pt: 1.5, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
                  <DetailFieldGrid
                    fields={[
                      { label: 'Price (₹)', value: `₹${product.price.toLocaleString('en-IN')}` },
                      { label: 'Total Interested Users', value: product.totalInterestedUsers },
                      { label: 'Showcase Visibility Status', value: product.showcaseVisible ? 'Visible' : 'Hidden' },
                      { label: 'Featured Product', value: product.featuredProduct ? 'Yes' : 'No' },
                    ]}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Interested Users">
          <CommonTable
            tableKey="showcase-product-interested-users"
            columns={userColumns}
            rows={filteredUsers}
            getRowId={(row) => row.id}
            searchPlaceholder="Search interested users…"
            searchKeys={(row) => `${row.userName} ${row.email}`}
            onFilterClick={() => setFilterOpen(true)}
            filterCount={(appliedFilters.enquiryStatus !== 'all' ? 1 : 0) + (appliedFilters.deliveryStatus !== 'all' ? 1 : 0)}
            defaultSortBy="interestedDate"
            emptyTitle="No interested users yet"
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Interested Users" value={product.totalInterestedUsers} icon={<Megaphone size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Product Views" value={product.totalProductViews.toLocaleString('en-IN')} icon={<Eye size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Reward Points Allocated" value={product.rewardPointsAllocated.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Products Delivered" value={product.productsDelivered} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
          </Grid>
        </Grid>

        <SectionCard title="Internal Notes">
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>{product.internalNotes}</Typography>
        </SectionCard>
      </Stack>

      <FilterDrawer<InterestedUserFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Interested Users"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Enquiry Status"
              size="small"
              value={draft.enquiryStatus}
              onChange={(e) => setDraft((prev) => ({ ...prev, enquiryStatus: e.target.value as InterestedUserFilters['enquiryStatus'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="responded">Responded</MenuItem>
            </TextField>
            <TextField
              select
              label="Delivery Status"
              size="small"
              value={draft.deliveryStatus}
              onChange={(e) => setDraft((prev) => ({ ...prev, deliveryStatus: e.target.value as InterestedUserFilters['deliveryStatus'] }))}
            >
              <MenuItem value="all">All Delivery Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="packed">Packed</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
