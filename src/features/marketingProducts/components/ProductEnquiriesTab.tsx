import { useState } from 'react'
import { Avatar, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { CircleCheck as CheckCircleOutlined, Hourglass as HourglassEmptyOutlined, PackageCheck, ClipboardCheck } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useShowcaseProducts } from '@/features/marketingProducts/hooks/useShowcaseProducts'
import { useShowcaseCategoryOptions } from '@/features/marketingProducts/hooks/useShowcaseCategoryOptions'
import type {
  DeliveryStatus,
  EnquiryStatus,
  ProductEnquiry,
  ShowcaseProduct,
  ShowcaseUserType,
} from '@/features/marketingProducts/types/marketingProducts.types'
import type { PartnerZone } from '@/types/partner'

interface EnquiryRow extends ProductEnquiry {
  product: ShowcaseProduct
}

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

interface EnquiryFilters extends Record<string, unknown> {
  category: string | 'all'
  userType: ShowcaseUserType | 'all'
  enquiryStatus: EnquiryStatus | 'all'
  deliveryStatus: DeliveryStatus | 'all'
}

interface ProductEnquiriesTabProps {
  onViewProduct: (product: ShowcaseProduct) => void
}

export function ProductEnquiriesTab({ onViewProduct }: ProductEnquiriesTabProps) {
  const { region } = useRegionFilter()
  const regionZone = region === 'All India' ? null : (region as PartnerZone)
  const { enquiries, kpis, markEnquiryResponded } = useShowcaseProducts()
  const showcaseCategoryOptions = useShowcaseCategoryOptions()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<EnquiryFilters>({
    category: 'all',
    userType: 'all',
    enquiryStatus: 'all',
    deliveryStatus: 'all',
  })

  const showcaseProductKpis = kpis ?? { totalEnquiries: 0, pendingEnquiries: 0, respondedEnquiries: 0, productsDelivered: 0 }

  const filteredRows: EnquiryRow[] = enquiries.filter((row) => {
    const regionMatch = !regionZone || row.product.region === regionZone
    const categoryMatch = appliedFilters.category === 'all' || row.product.category === appliedFilters.category
    const userTypeMatch = appliedFilters.userType === 'all' || row.userType === appliedFilters.userType
    const enquiryMatch = appliedFilters.enquiryStatus === 'all' || row.enquiryStatus === appliedFilters.enquiryStatus
    const deliveryMatch = appliedFilters.deliveryStatus === 'all' || row.deliveryStatus === appliedFilters.deliveryStatus
    return regionMatch && categoryMatch && userTypeMatch && enquiryMatch && deliveryMatch
  })

  const columns: CommonTableColumn<EnquiryRow>[] = [
    {
      key: 'product',
      header: 'Product',
      minWidth: 220,
      sortable: true,
      sortValue: (row) => row.product.productName,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar src={row.product.productImage} variant="rounded" sx={{ width: 32, height: 32 }} />
          <Typography
            sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => onViewProduct(row.product)}
          >
            {row.product.productName}
          </Typography>
        </Stack>
      ),
    },
    { key: 'sku', header: 'SKU', minWidth: 130, render: (row) => row.product.sku },
    { key: 'category', header: 'Category', minWidth: 130, render: (row) => row.product.category },
    { key: 'price', header: 'Price (₹)', align: 'right', sortable: true, sortValue: (row) => row.product.price, render: (row) => `₹${row.product.price.toLocaleString('en-IN')}` },
    { key: 'userName', header: 'User Name', minWidth: 150, render: (row) => row.userName },
    { key: 'userType', header: 'User Type', minWidth: 100, render: (row) => row.userType },
    { key: 'interestedDate', header: 'Interested Date', minWidth: 140, sortable: true, render: (row) => row.interestedDate },
    {
      key: 'enquiryStatus',
      header: 'Enquiry Status',
      minWidth: 130,
      render: (row) => <Chip size="small" label={enquiryStatusConfig[row.enquiryStatus].label} color={enquiryStatusConfig[row.enquiryStatus].color} />,
    },
    {
      key: 'deliveryStatus',
      header: 'Delivery Status',
      minWidth: 140,
      render: (row) => <Chip size="small" label={deliveryStatusConfig[row.deliveryStatus].label} color={deliveryStatusConfig[row.deliveryStatus].color} />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Enquiries" value={showcaseProductKpis.totalEnquiries} icon={<ClipboardCheck size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Pending Enquiries" value={showcaseProductKpis.pendingEnquiries} icon={<HourglassEmptyOutlined size={20} />} iconColor="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Responded Enquiries" value={showcaseProductKpis.respondedEnquiries} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Products Delivered" value={showcaseProductKpis.productsDelivered} icon={<PackageCheck size={20} />} iconColor="secondary" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="showcase-product-enquiries"
        columns={columns}
        rows={filteredRows}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by product name or user name…"
        searchKeys={(row) => `${row.product.productName} ${row.userName} ${row.product.sku}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.category !== 'all' ? 1 : 0) +
          (appliedFilters.userType !== 'all' ? 1 : 0) +
          (appliedFilters.enquiryStatus !== 'all' ? 1 : 0) +
          (appliedFilters.deliveryStatus !== 'all' ? 1 : 0)
        }
        onExportClick={() => {}}
        createAction={{ label: 'Create Product', to: '/marketing-products/products-catelog/new' }}
        defaultSortBy="interestedDate"
        defaultSortDir="desc"
        actions={[
          { label: 'View Product Details', onClick: (row) => onViewProduct(row.product) },
          { label: 'Mark as Responded', onClick: (row) => markEnquiryResponded(row.id) },
        ]}
        emptyTitle="No enquiries found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<EnquiryFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Enquiries"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Category"
              size="small"
              value={draft.category}
              onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {showcaseCategoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="User Type"
              size="small"
              value={draft.userType}
              onChange={(e) => setDraft((prev) => ({ ...prev, userType: e.target.value as EnquiryFilters['userType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
            <TextField
              select
              label="Enquiry Status"
              size="small"
              value={draft.enquiryStatus}
              onChange={(e) => setDraft((prev) => ({ ...prev, enquiryStatus: e.target.value as EnquiryFilters['enquiryStatus'] }))}
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
              onChange={(e) => setDraft((prev) => ({ ...prev, deliveryStatus: e.target.value as EnquiryFilters['deliveryStatus'] }))}
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
