import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  Package as Inventory2Icon,
  CircleCheck as CheckCircleOutlined,
  Ban as BlockOutlined,
  Trophy as EmojiEventsOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useProducts } from '@/features/inventoryManagement/hooks/useProducts'
import { useProductCategoryOptions } from '@/features/inventoryManagement/hooks/useProductCategoryOptions'
import type { Product, ProductStatus } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface ProductFilters extends Record<string, unknown> {
  category: string | 'all'
  status: ProductStatus | 'all'
  fromDate: string
  toDate: string
}

export function ProductListPage() {
  const navigate = useNavigate()
  const { products, kpis } = useProducts()
  const productCategoryOptions = useProductCategoryOptions()
  useRegionTopbarHeader({
    icon: <Inventory2Icon size={20} />,
    title: 'Product Master',
    subtitle:
      'Centralized repository for all products and their reward point configuration.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({
    category: 'all',
    status: 'all',
    fromDate: '',
    toDate: '',
  })

  const productKpis = kpis ?? { totalProducts: 0, activeProducts: 0, inactiveProducts: 0, totalRewardPointsIssued: 0 }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatch =
          appliedFilters.category === 'all' ||
          product.productCategory === appliedFilters.category
        const statusMatch =
          appliedFilters.status === 'all' ||
          product.status === appliedFilters.status
        return categoryMatch && statusMatch
      }),
    [products, appliedFilters],
  )

  const columns: CommonTableColumn<Product>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.productName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/inventory/product-master/${row.id}`)}
        >
          {row.productName}
        </Typography>
      ),
    },
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 140,
      render: (row) => row.productCode,
    },
    {
      key: 'productCategory',
      header: 'Product Category',
      sortable: true,
      render: (row) => row.productCategory,
    },
    {
      key: 'dealerRewardPoints',
      header: 'Dealer Points',
      align: 'center',
      minWidth: 50,
      sortable: true,
      sortValue: (row) => row.dealerRewardPoints,
      render: (row) => row.dealerRewardPoints,
    },
    {
      key: 'chemistRewardPoints',
      header: 'Chemist Points',
      align: 'center',
      minWidth: 50,
      sortable: true,
      sortValue: (row) => row.chemistRewardPoints,
      render: (row) => row.chemistRewardPoints,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'uploadedDate',
      header: 'Uploaded Date',
      minWidth: 140,
      render: (row) => row.uploadedDate,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Products"
            value={productKpis.totalProducts}
            icon={<Inventory2Icon size={20} />}
            iconColor="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Active Products"
            value={productKpis.activeProducts}
            icon={<CheckCircleOutlined size={20} />}
            iconColor="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Inactive Products"
            value={productKpis.inactiveProducts}
            icon={<BlockOutlined size={20} />}
            iconColor="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Reward Points Issued"
            value={productKpis.totalRewardPointsIssued.toLocaleString('en-IN')}
            icon={<EmojiEventsOutlined size={20} />}
            iconColor="secondary"
          />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="product-master-list"
        columns={columns}
        rows={filteredProducts}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by product name or code…"
        searchKeys={(row) => `${row.productName} ${row.productCode}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.category !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        onImportClick={() => {}}
        createAction={{
          label: 'Add Product',
          to: '/inventory/product-master/new',
        }}
        defaultSortBy="productName"
        actions={[
          {
            label: 'View Product',
            onClick: (row) => navigate(`/inventory/product-master/${row.id}`),
          },
          {
            label: 'Edit Product',
            onClick: (row) =>
              navigate(`/inventory/product-master/${row.id}/edit`),
          },
          { label: 'Activate Product', onClick: () => {} },
          { label: 'Deactivate Product', onClick: () => {} },
          { label: 'Delete Product', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<ProductFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Products"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Product Category"
              size="small"
              value={draft.category}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              <MenuItem value="all">All Categories</MenuItem>
              {productCategoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as ProductFilters['status'],
                }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Uploaded From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, fromDate: e.target.value }))
              }
            />
            <TextField
              type="date"
              label="Uploaded To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, toDate: e.target.value }))
              }
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
