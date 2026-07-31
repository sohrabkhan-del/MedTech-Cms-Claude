import { useState } from 'react'
import { MenuItem, Stack, TextField, Typography } from '@mui/material'
import { SlidersHorizontal as SlidersHorizontalIcon } from 'lucide-react'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useProductCategories } from '@/features/masters/hooks/useProductCategories'
import type {
  ProductCategory,
  ProductCategoryStatus,
} from '@/features/masters/types/masters.types'

interface CategoryFilters extends Record<string, unknown> {
  status: ProductCategoryStatus | 'all'
  fromDate: string
  toDate: string
}

// Maps CommonTable column keys to the real GET /categories `sortBy` field
// names. UNVERIFIED against the backend — best-effort guess based on the
// API's own response field names (name, code, createdAt).
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  categoryName: 'name',
  categoryCode: 'code',
  createdDate: 'createdAt',
}

export function ProductCategoryListPage() {
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<CategoryFilters>({
    status: 'all',
    fromDate: '',
    toDate: '',
  })
  const [sortColumn, setSortColumn] = useState('categoryName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { categories, isLoading } = useProductCategories({
    page: 1,
    limit: 10,
    search: debouncedSearch,
    status: appliedFilters.status,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
  })
  useRegionTopbarHeader({
    icon: <SlidersHorizontalIcon size={20} />,
    title: 'Product Categories',
    subtitle:
      'Organize MedTech products into categories for reporting, schemes, and analytics.',
    isLoading,
  })

  const filteredCategories = categories.filter((category) => {
    const fromMatch =
      !appliedFilters.fromDate ||
      new Date(category.createdDate) >= new Date(appliedFilters.fromDate)
    const toMatch =
      !appliedFilters.toDate ||
      new Date(category.createdDate) <= new Date(appliedFilters.toDate)
    return fromMatch && toMatch
  })

  const columns: CommonTableColumn<ProductCategory>[] = [
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
            fontSize: '0.875rem',
          }}
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
      key: 'createdDate',
      header: 'Created Date',
      minWidth: 130,
      sortable: true,
      render: (row) => row.createdDate,
    },
  ]

  return (
    <>
      <CommonTable
        key={appliedFilters.status}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        tableKey="product-categories-list"
        columns={columns}
        rows={filteredCategories}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search categories…"
        searchValue={search}
        onSearchChange={setSearch}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="categoryName"
        defaultSortDir="desc"
        emptyTitle="No categories found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<CategoryFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Categories"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as CategoryFilters['status'],
                }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Created From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, fromDate: e.target.value }))
              }
            />
            <TextField
              type="date"
              label="Created To"
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
