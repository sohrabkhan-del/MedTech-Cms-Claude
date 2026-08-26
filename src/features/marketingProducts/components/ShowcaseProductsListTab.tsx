import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  CircleCheck as CheckCircleOutlined,
  Hourglass as HourglassEmptyOutlined,
  Package,
  ClipboardCheck,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { useShowcaseProducts } from '@/features/marketingProducts/hooks/useShowcaseProducts'
import { CategoryMultiSelectAutocomplete } from '@/components/common/CategoryAutocompleteField/CategoryMultiSelectAutocomplete'
import type { CategoryOption } from '@/features/marketingProducts/services/showcaseProductsApi'
import type {
  ShowcaseProduct,
  ShowcaseVisibility,
} from '@/features/marketingProducts/types/marketingProducts.types'

interface ProductFilters extends Record<string, unknown> {
  categories: CategoryOption[]
  visibleTo: ShowcaseVisibility | 'all'
  status: 'active' | 'inactive' | 'all'
}

// Maps CommonTable column keys to GET /showcase-products `sortBy` field names.
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  name: 'name',
  mrp: 'mrp',
  createdAt: 'createdAt',
}

interface ShowcaseProductsListTabProps {
  onViewProduct: (product: ShowcaseProduct) => void
}

export function ShowcaseProductsListTab({
  onViewProduct,
}: ShowcaseProductsListTabProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({
    categories: [],
    visibleTo: 'all',
    status: 'all',
  })
  const [sortColumn, setSortColumn] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [rowsPerPageOptions, setRowsPerPageOptions] = useState<
    Array<number | { value: number; label: string }>
  >([10, 20, 50])

  const debouncedSearch = useDebouncedValue(search, 300)

  const categoryIdParam =
    appliedFilters.categories.length > 0
      ? appliedFilters.categories.map((c) => c.id).join(',')
      : 'all'

  const {
    products,
    totalCount,
    kpis,
    isLoading,
    isKpisLoading,
    deleteProduct,
  } = useShowcaseProducts({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch,
    categoryId: categoryIdParam,
    visibleTo: appliedFilters.visibleTo,
    status: appliedFilters.status,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
  })

  useEffect(() => {
    if (!totalCount) return
    setRowsPerPageOptions((base) => {
      const baseValues = base.map((o) => (typeof o === 'number' ? o : o.value))
      const setVals = new Set<number>([...baseValues, totalCount])
      const vals = Array.from(setVals).sort((a, b) => a - b)
      // Map totalCount to a labeled "All (total)" option
      return vals.map((v) =>
        v === totalCount ? { value: v, label: `All (${v})` } : v,
      )
    })

    if (totalCount > 0 && totalCount < rowsPerPage) {
      setRowsPerPage(totalCount)
      setPage(0)
    }
  }, [totalCount])

  const showcaseProductKpis = kpis ?? {
    totalProducts: 0,
    activeProducts: 0,
    productsEnquiredFor: 0,
    totalPendingEnquiries: 0,
  }

  const columns: CommonTableColumn<ShowcaseProduct>[] = [
    {
      key: 'name',
      header: 'Product',
      minWidth: 220,
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => onViewProduct(row)}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 130,
      align: 'center',
      render: (row) => row.productCode,
    },
    {
      key: 'category',
      header: 'Category',
      minWidth: 130,
      align: 'center',
      render: (row) => row.category?.name ?? '-',
    },

    {
      key: 'mrp',
      header: 'MRP (₹)',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.mrp,
      render: (row) => `₹${row.mrp.toLocaleString('en-IN')}`,
    },
    {
      key: 'dealerPrice',
      header: 'Dealer Price (₹)',
      align: 'center',
      render: (row) => `₹${row.dealerPrice.toLocaleString('en-IN')}`,
    },
    {
      key: 'chemistPrice',
      header: 'Chemist Price (₹)',
      align: 'center',
      render: (row) => `₹${row.chemistPrice.toLocaleString('en-IN')}`,
    },
    {
      key: 'visibleTo',
      header: 'Visible To',
      minWidth: 150,
      align: 'center',
      render: (row) =>
        row.visibleTo
          .map((v) => (v === 'dealer' ? 'Dealer' : 'Chemist'))
          .join(', '),
    },
    {
      key: 'isActive',
      header: 'Status',
      minWidth: 100,
      align: 'center',
      render: (row) => (
        <Chip
          size="small"
          label={row.isActive ? 'Active' : 'Inactive'}
          color={row.isActive ? 'success' : 'default'}
        />
      ),
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Products"
              value={showcaseProductKpis.totalProducts}
              icon={<Package size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Active Products"
              value={showcaseProductKpis.activeProducts}
              icon={<CheckCircleOutlined size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Products Enquired For"
              value={showcaseProductKpis.productsEnquiredFor}
              icon={<ClipboardCheck size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Pending Enquiries"
              value={showcaseProductKpis.totalPendingEnquiries}
              icon={<HourglassEmptyOutlined size={20} />}
              iconColor="warning"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        key={`${categoryIdParam}-${appliedFilters.visibleTo}-${appliedFilters.status}`}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        tableKey="showcase-products-catalog"
        columns={columns}
        rows={products}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by product name or code…"
        searchValue={search}
        onSearchChange={setSearch}
        totalCount={totalCount}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(n) => {
          setRowsPerPage(n)
          setPage(0)
        }}
        rowsPerPageOptions={rowsPerPageOptions}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.categories.length > 0 ? 1 : 0) +
          (appliedFilters.visibleTo !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0)
        }
        onExportClick={() => {}}
        createAction={{
          label: 'Create Product',
          to: '/marketing-products/products-catelog/new',
        }}

        defaultSortBy={sortColumn}
        defaultSortDir={sortOrder}

        actions={[
          {
            label: 'View Product Details',
            onClick: (row) => onViewProduct(row),
          },
          {
            label: 'Edit Product',
            onClick: (row) =>
              navigate(`/marketing-products/products-catelog/${row.id}/edit`),
          },
          {
            label: 'Delete Product',
            danger: true,
            onClick: async (row) => {
              try {
                await deleteProduct(row.id)
                toast.success('Product deleted successfully.')
              } catch (err) {
                toast.error(
                  getApiErrorMessage(err, 'Failed to delete product.'),
                )
              }
            },
          },
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
            <CategoryMultiSelectAutocomplete
              label="Category"
              placeholder="All Categories"
              value={draft.categories}
              onChange={(selected) =>
                setDraft((prev) => ({ ...prev, categories: selected }))
              }
            />
            <TextField
              select
              label="Visible To"
              size="small"
              value={draft.visibleTo}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  visibleTo: e.target.value as ProductFilters['visibleTo'],
                }))
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="dealer">Dealer</MenuItem>
              <MenuItem value="chemist">Chemist</MenuItem>
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
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
