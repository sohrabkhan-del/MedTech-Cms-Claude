import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  SlidersHorizontal as SlidersHorizontalIcon,
  FolderTree as FolderTreeIcon,
  CircleCheck as CircleCheckIcon,
  Ban as BanIcon,
  Package as PackageIcon,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { Grid } from '@mui/material'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useProductCategories } from '@/features/masters/hooks/useProductCategories'
import { productCategoriesService } from '@/features/masters/services/productCategoriesService'
import type { ProductCategory, ProductCategoryStatus } from '@/features/masters/types/masters.types'

interface CategoryFilters extends Record<string, unknown> {
  status: ProductCategoryStatus | 'all'
  parent: string | 'all'
  fromDate: string
  toDate: string
}

export function ProductCategoryListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <SlidersHorizontalIcon size={20} />,
    title: 'Product Categories',
    subtitle: 'Organize MedTech products into categories for reporting, schemes, and analytics.',
  })
  const { categories, kpis, isLoading } = useProductCategories()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<CategoryFilters>({
    status: 'all',
    parent: 'all',
    fromDate: '',
    toDate: '',
  })

  const categoryKpis = kpis ?? { totalCategories: 0, activeCategories: 0, inactiveCategories: 0, totalProductsMapped: 0 }

  const filteredCategories = categories.filter((category) => {
    const statusMatch = appliedFilters.status === 'all' || category.status === appliedFilters.status
    const parentMatch =
      appliedFilters.parent === 'all' ||
      (appliedFilters.parent === 'none' ? !category.parentCategoryId : category.parentCategoryId === appliedFilters.parent)
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
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/masters/product-categories/${row.id}`)}
        >
          {row.categoryName}
        </Typography>
      ),
    },
    { key: 'categoryCode', header: 'Category Code', minWidth: 140, render: (row) => row.categoryCode },
    {
      key: 'parentCategory',
      header: 'Parent Category',
      minWidth: 160,
      render: (row) => productCategoriesService.resolveParentCategoryName(row.parentCategoryId) ?? '—',
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
    { key: 'createdDate', header: 'Created Date', minWidth: 130, sortable: true, render: (row) => row.createdDate },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard label="Total Categories" value={categoryKpis.totalCategories} icon={<FolderTreeIcon size={20} />} iconColor="primary" />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard label="Active" value={categoryKpis.activeCategories} icon={<CircleCheckIcon size={20} />} iconColor="success" />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard label="Inactive" value={categoryKpis.inactiveCategories} icon={<BanIcon size={20} />} iconColor="error" />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard label="Products Mapped" value={categoryKpis.totalProductsMapped} icon={<PackageIcon size={20} />} iconColor="secondary" />
          )}
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mb: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          color="success"
          startIcon={<FileSpreadsheet size={16} />}
          onClick={() => {}}
          sx={{ fontSize: '0.75rem' }}
        >
          Export Excel
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          startIcon={<FileText size={16} />}
          onClick={() => {}}
          sx={{ fontSize: '0.75rem' }}
        >
          Export CSV
        </Button>
      </Stack>

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
        createAction={{ label: 'Create Category', to: '/masters/product-categories/new' }}
        defaultSortBy="categoryName"
        actions={[
          { label: 'View Details', onClick: (row) => navigate(`/masters/product-categories/${row.id}`) },
          { label: 'Edit Category', onClick: (row) => navigate(`/masters/product-categories/${row.id}/edit`) },
        ]}
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
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as CategoryFilters['status'] }))}
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
              onChange={(e) => setDraft((prev) => ({ ...prev, parent: e.target.value }))}
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
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Created To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, toDate: e.target.value }))}
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
