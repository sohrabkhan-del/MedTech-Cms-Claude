import { useState } from 'react'
import { Avatar, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { SlidersHorizontal as SlidersHorizontalIcon } from 'lucide-react'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useProductCategories } from '@/features/masters/hooks/useProductCategories'
import type {
  ProductCategory,
  ProductCategoryStatus,
} from '@/features/masters/types/masters.types'

interface CategoryFilters extends Record<string, unknown> {
  status: ProductCategoryStatus | 'all'
  parent: string | 'all'
  fromDate: string
  toDate: string
}

export function ProductCategoryListPage() {
  const { categories, isLoading } = useProductCategories()
  useRegionTopbarHeader({
    icon: <SlidersHorizontalIcon size={20} />,
    title: 'Product Categories',
    subtitle:
      'Organize MedTech products into categories for reporting, schemes, and analytics.',
    isLoading,
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<CategoryFilters>({
    status: 'all',
    parent: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredCategories = categories.filter((category) => {
    const statusMatch =
      appliedFilters.status === 'all' ||
      category.status === appliedFilters.status
    const parentMatch =
      appliedFilters.parent === 'all' ||
      (appliedFilters.parent === 'none'
        ? !category.parentCategoryId
        : category.parentCategoryId === appliedFilters.parent)
    return statusMatch && parentMatch
  })

  const columns: CommonTableColumn<ProductCategory>[] = [
    {
      key: 'categoryName',
      header: 'Category Name',
      minWidth: 220,
      sortable: true,
      sortValue: (row) => row.categoryName,
      render: (row) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar
            src={row.image}
            alt={row.categoryName}
            variant="rounded"
            sx={{ width: 36, height: 36 }}
          />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {row.categoryName}
          </Typography>
        </Stack>
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
        tableKey="product-categories-list"
        columns={columns}
        rows={filteredCategories}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search categories…"
        searchKeys={(row) => `${row.categoryName} ${row.categoryCode}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.parent !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="categoryName"

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
              select
              label="Parent Category"
              size="small"
              value={draft.parent}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, parent: e.target.value }))
              }
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="none">No Parent (Top Level)</MenuItem>
              {categories
                .filter((c) => !c.parentCategoryId)
                .map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.categoryName}
                  </MenuItem>
                ))}
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
