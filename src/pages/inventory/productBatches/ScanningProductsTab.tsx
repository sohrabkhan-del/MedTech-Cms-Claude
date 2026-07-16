import { useMemo, useState } from 'react'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  Box as ViewInArOutlined,
  QrCode as QrCode2Outlined,
  CircleCheck as CheckCircleOutlined,
  CircleCheckBig as TaskAltOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { mockProductBatches, productBatchKpis } from '@/features/inventory/mockProductBatches'
import { productCategoryOptions } from '@/features/inventory/mockProducts'
import type { BatchActiveStatus, BatchScanStatus, ProductBatch } from '@/types/productBatch'

interface ProductBatchFilters extends Record<string, unknown> {
  category: string | 'all'
  scanStatus: BatchScanStatus | 'all'
  activeStatus: BatchActiveStatus | 'all'
}

const scanStatusConfig: Record<BatchScanStatus, { label: string; color: 'default' | 'warning' | 'success' }> = {
  not_started: { label: 'Not Started', color: 'default' },
  in_progress: { label: 'In Progress', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
}

const activeStatusConfig: Record<BatchActiveStatus, { label: string; color: 'success' | 'error' | 'default' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'error' },
  expired: { label: 'Expired', color: 'default' },
}

export function ScanningProductsTab() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ProductBatchFilters>({
    category: 'all',
    scanStatus: 'all',
    activeStatus: 'all',
  })

  const filteredBatches = useMemo(
    () =>
      mockProductBatches.filter((batch) => {
        const categoryMatch = appliedFilters.category === 'all' || batch.category === appliedFilters.category
        const scanMatch = appliedFilters.scanStatus === 'all' || batch.scanStatus === appliedFilters.scanStatus
        const activeMatch = appliedFilters.activeStatus === 'all' || batch.activeStatus === appliedFilters.activeStatus
        return categoryMatch && scanMatch && activeMatch
      }),
    [appliedFilters],
  )

  const columns: CommonTableColumn<ProductBatch>[] = [
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.productCode,
      render: (row) => <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{row.productCode}</Typography>,
    },
    { key: 'productName', header: 'Product Name', minWidth: 180, sortable: true, sortValue: (row) => row.productName, render: (row) => row.productName },
    { key: 'category', header: 'Category', minWidth: 140, sortable: true, sortValue: (row) => row.category, render: (row) => row.category },
    { key: 'batchNo', header: 'Batch No', minWidth: 110, render: (row) => row.batchNo },
    {
      key: 'serialRange',
      header: 'Serial Range',
      minWidth: 170,
      render: (row) => `${row.serialRangeStart} – ${row.serialRangeEnd}`,
    },
    {
      key: 'coinValue',
      header: 'Coin Value',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.coinValue,
      render: (row) => row.coinValue,
    },
    {
      key: 'scanStatus',
      header: 'Scan Status',
      minWidth: 120,
      render: (row) => <Chip size="small" label={scanStatusConfig[row.scanStatus].label} color={scanStatusConfig[row.scanStatus].color} />,
    },
    {
      key: 'totalScans',
      header: 'Total Scans',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.totalScans,
      render: (row) => row.totalScans.toLocaleString('en-IN'),
    },
    {
      key: 'activeStatus',
      header: 'Active Status',
      minWidth: 110,
      render: (row) => <Chip size="small" label={activeStatusConfig[row.activeStatus].label} color={activeStatusConfig[row.activeStatus].color} />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Batches" value={productBatchKpis.totalBatches} icon={<ViewInArOutlined size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Active Batches" value={productBatchKpis.activeBatches} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Scans" value={productBatchKpis.totalScans.toLocaleString('en-IN')} icon={<QrCode2Outlined size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Scan Completed" value={productBatchKpis.scanCompleted} icon={<TaskAltOutlined size={20} />} iconColor="warning" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="product-batches-scanning-products"
        columns={columns}
        rows={filteredBatches}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by product code or name…"
        searchKeys={(row) => `${row.productCode} ${row.productName} ${row.batchNo}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.category !== 'all' ? 1 : 0) +
          (appliedFilters.scanStatus !== 'all' ? 1 : 0) +
          (appliedFilters.activeStatus !== 'all' ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="productName"
        actions={[
          { label: 'View Batch', onClick: () => {} },
          { label: 'Activate Batch', onClick: () => {} },
          { label: 'Deactivate Batch', onClick: () => {} },
        ]}
        emptyTitle="No product batches found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<ProductBatchFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Product Batches"
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
              {productCategoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Scan Status"
              size="small"
              value={draft.scanStatus}
              onChange={(e) => setDraft((prev) => ({ ...prev, scanStatus: e.target.value as ProductBatchFilters['scanStatus'] }))}
            >
              <MenuItem value="all">All Scan Statuses</MenuItem>
              <MenuItem value="not_started">Not Started</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <TextField
              select
              label="Active Status"
              size="small"
              value={draft.activeStatus}
              onChange={(e) => setDraft((prev) => ({ ...prev, activeStatus: e.target.value as ProductBatchFilters['activeStatus'] }))}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
