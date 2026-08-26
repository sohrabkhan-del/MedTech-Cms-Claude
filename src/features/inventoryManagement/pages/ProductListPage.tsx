import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  Package as Inventory2Icon,
  FolderTree as FolderTreeIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useProducts } from '@/features/inventoryManagement/hooks/useProducts'
import { useProductCategories } from '@/features/masters/hooks/useProductCategories'
import type {
  Product,
  ProductStatus,
} from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { ProductCategory } from '@/features/masters/types/masters.types'

interface ProductFilters extends Record<string, unknown> {
  category: string | 'all'
  status: ProductStatus | 'all'
  fromDate: string
  toDate: string
}

export function ProductListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { products, totalItems, kpis, isLoading } = useProducts({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch || undefined,
  })
  const { categories, isLoading: categoriesLoading } = useProductCategories()
  const productCategoryOptions = useMemo(
    () => categories.map((category) => category.categoryName),
    [categories],
  )
  useRegionTopbarHeader({
    icon: <Inventory2Icon size={20} />,
    title: 'Product Master',
    subtitle:
      'Centralized repository for all products and their reward point configuration.',
    isLoading: isLoading || categoriesLoading,
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'products' | 'categories'>(
    'products',
  )
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({
    category: 'all',
    status: 'all',
    fromDate: '',
    toDate: '',
  })

  const productKpis = kpis ?? {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    newProducts: 0,
    totalCategories: 0,
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatch =
          appliedFilters.category === 'all' ||
          product.productCategory === appliedFilters.category
        const statusMatch =
          appliedFilters.status === 'all' ||
          product.status === appliedFilters.status

        const uploadedDate = new Date(product.uploadedDate)
        const fromMatch =
          !appliedFilters.fromDate ||
          uploadedDate >= new Date(appliedFilters.fromDate)
        const toMatch =
          !appliedFilters.toDate ||
          uploadedDate <= new Date(appliedFilters.toDate)

        return categoryMatch && statusMatch && fromMatch && toMatch
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
      key: 'uploadedDate',
      header: 'Uploaded Date',
      minWidth: 140,
      render: (row) => row.uploadedDate,
    },
  ]

  const categoryColumns: CommonTableColumn<ProductCategory>[] = [
    {
      key: 'categoryName',
      header: 'Category Name',
      minWidth: 220,
      sortable: true,
      sortValue: (row) => row.categoryName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/masters/product-categories/${row.id}`)}
        >
          {row.categoryName}
        </Typography>
      ),
    },
    {
      key: 'categoryCode',
      header: 'Category Code',
      minWidth: 140,
      render: (row) => row.categoryCode,
    },
    {
      key: 'totalProducts',
      header: 'Total Products',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.totalProducts,
      render: (row) => row.totalProducts,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdDate',
      header: 'Created Date',
      minWidth: 130,
      sortable: true,
      render: (row) => row.createdDate,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Products"
              value={productKpis.totalProducts}
              icon={<Inventory2Icon size={20} />}
              iconColor="primary"
              onClick={() => {
                setViewMode('products')
                setAppliedFilters((prev) => ({ ...prev, status: 'all' }))
              }}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Category"
              value={productKpis.totalCategories}
              icon={<FolderTreeIcon size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
      </Grid>

      {viewMode === 'categories' ? (
        <CommonTable
          tableKey="product-master-categories"
          columns={categoryColumns}
          rows={categories}
          loading={categoriesLoading}
          getRowId={(row) => row.id}
          searchPlaceholder="Search categories…"
          searchKeys={(row) => `${row.categoryName} ${row.categoryCode}`}
          defaultSortBy="categoryName"
          actions={[
            {
              label: 'View Details',
              onClick: (row) =>
                navigate(`/masters/product-categories/${row.id}`),
            },
          ]}
          emptyTitle="No categories found"
          emptyDescription="Try adjusting your search terms."
        />
      ) : (
        <CommonTable
          tableKey="product-master-list"
          totalCount={totalItems}
          page={page}
          onPageChange={setPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(next) => {
            setRowsPerPage(next)
            setPage(0)
          }}
          columns={columns}
          rows={filteredProducts}
          loading={isLoading}
          getRowId={(row) => row.id}
          searchPlaceholder="Search by product name or code…"
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(0)
          }}
          onFilterClick={() => setFilterOpen(true)}
          filterCount={
            (appliedFilters.category !== 'all' ? 1 : 0) +
            (appliedFilters.status !== 'all' ? 1 : 0) +
            (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
          }
          onExportClick={() => {}}

          defaultSortBy="productName"
          actions={[
            {
              label: 'View Product',
              onClick: (row) => navigate(`/inventory/product-master/${row.id}`),
            },
          ]}
          emptyTitle="No products found"
          emptyDescription="Try adjusting your filters or search terms."
        />
      )}

      <FilterDrawer<ProductFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Products"
        value={appliedFilters}
        onApply={(next) => {
          setAppliedFilters(next)
          setPage(0)
        }}
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
