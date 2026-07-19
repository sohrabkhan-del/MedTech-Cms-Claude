import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { BarChart3, Package as Inventory2Icon, ScanLine, Trophy, CircleCheck } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import {
  mockProductReports,
  productReportKpis,
  productReportCategoryOptions,
  productReportBatchOptions,
} from '@/features/reports/mockProductReports'
import type { ProductReportEntry } from '@/types/productReport'
import type { ProductStatus } from '@/types/product'

interface ProductReportFilters extends Record<string, unknown> {
  category: string | 'all'
  batch: string | 'all'
  status: ProductStatus | 'all'
  fromDate: string
  toDate: string
}

export function ProductReportListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <BarChart3 size={20} />,
    title: 'Product Reports',
    subtitle: 'Displays product-wise scan performance and reward distribution.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ProductReportFilters>({
    category: 'all',
    batch: 'all',
    status: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredReports = useMemo(
    () =>
      mockProductReports.filter((report) => {
        const categoryMatch = appliedFilters.category === 'all' || report.productCategory === appliedFilters.category
        const batchMatch = appliedFilters.batch === 'all' || report.batch === appliedFilters.batch
        const statusMatch = appliedFilters.status === 'all' || report.status === appliedFilters.status
        const fromMatch = !appliedFilters.fromDate || report.uploadedDate >= appliedFilters.fromDate
        const toMatch = !appliedFilters.toDate || report.uploadedDate <= appliedFilters.toDate
        return categoryMatch && batchMatch && statusMatch && fromMatch && toMatch
      }),
    [appliedFilters],
  )

  const columns: CommonTableColumn<ProductReportEntry>[] = [
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 140,
      render: (row) => row.productCode,
    },
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
          onClick={() => navigate(`/reports/product-reports-1/${row.id}`)}
        >
          {row.productName}
        </Typography>
      ),
    },
    {
      key: 'productCategory',
      header: 'Category',
      sortable: true,
      render: (row) => row.productCategory,
    },
    {
      key: 'batch',
      header: 'Batch',
      minWidth: 150,
      render: (row) => row.batch,
    },
    {
      key: 'totalScans',
      header: 'Total Scans',
      align: 'right',
      minWidth: 110,
      sortable: true,
      sortValue: (row) => row.totalScans,
      render: (row) => row.totalScans.toLocaleString('en-IN'),
    },
    {
      key: 'rewardPoints',
      header: 'Reward Points',
      align: 'right',
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.rewardPoints,
      render: (row) => row.rewardPoints.toLocaleString('en-IN'),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Products" value={productReportKpis.totalProducts} icon={<Inventory2Icon size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Scans" value={productReportKpis.totalScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Reward Points Issued" value={productReportKpis.rewardPointsIssued.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Active Products" value={productReportKpis.activeProducts} icon={<CircleCheck size={20} />} iconColor="success" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="product-reports-list"
        columns={columns}
        rows={filteredReports}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by product name or code…"
        searchKeys={(row) => `${row.productName} ${row.productCode} ${row.batch}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.category !== 'all' ? 1 : 0) +
          (appliedFilters.batch !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="productName"
        actions={[{ label: 'View', onClick: (row) => navigate(`/reports/product-reports-1/${row.id}`) }]}
        emptyTitle="No product reports found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<ProductReportFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Product Reports"
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
              {productReportCategoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Batch"
              size="small"
              value={draft.batch}
              onChange={(e) => setDraft((prev) => ({ ...prev, batch: e.target.value }))}
            >
              <MenuItem value="all">All Batches</MenuItem>
              {productReportBatchOptions.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as ProductReportFilters['status'] }))}
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
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Uploaded To"
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
