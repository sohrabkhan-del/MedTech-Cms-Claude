import { useMemo, useState } from 'react'
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  Package as Inventory2Outlined,
  CircleCheck as CheckCircleOutlined,
  Ban as BlockOutlined,
  QrCode as QrCode2Outlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useProductBatches } from '@/features/inventoryManagement/hooks/useProductBatches'
import { useProductCategoryOptions } from '@/features/inventoryManagement/hooks/useProductCategoryOptions'
import type { BatchActiveStatus, ProductionBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface BatchListingFilters extends Record<string, unknown> {
  category: string | 'all'
  status: BatchActiveStatus | 'all'
  batchNo: string
  manufacturingFrom: string
  manufacturingTo: string
  expiryFrom: string
  expiryTo: string
}

interface BatchListingTabProps {
  onViewBatch: (batch: ProductionBatch) => void
}

export function BatchListingTab({ onViewBatch }: BatchListingTabProps) {
  const { batches, kpis, isLoading } = useProductBatches()
  const productCategoryOptions = useProductCategoryOptions()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<BatchListingFilters>({
    category: 'all',
    status: 'all',
    batchNo: '',
    manufacturingFrom: '',
    manufacturingTo: '',
    expiryFrom: '',
    expiryTo: '',
  })

  const productionBatchKpis = kpis ?? { totalBatches: 0, activeBatches: 0, expiredBatches: 0, totalScans: 0 }

  const filteredBatches = useMemo(
    () =>
      batches.filter((batch) => {
        const categoryMatch = appliedFilters.category === 'all' || batch.productCategory === appliedFilters.category
        const statusMatch = appliedFilters.status === 'all' || batch.status === appliedFilters.status
        const batchMatch = !appliedFilters.batchNo || batch.batchNo.toLowerCase().includes(appliedFilters.batchNo.toLowerCase())
        return categoryMatch && statusMatch && batchMatch
      }),
    [batches, appliedFilters],
  )

  const columns: CommonTableColumn<ProductionBatch>[] = [
    {
      key: 'batchNo',
      header: 'Batch No',
      minWidth: 110,
      sortable: true,
      sortValue: (row) => row.batchNo,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => onViewBatch(row)}
        >
          {row.batchNo}
        </Typography>
      ),
    },
    { key: 'productCode', header: 'Product Code', minWidth: 130, render: (row) => row.productCode },
    { key: 'productName', header: 'Product Name', minWidth: 170, sortable: true, sortValue: (row) => row.productName, render: (row) => row.productName },
    { key: 'productCategory', header: 'Product Category', minWidth: 140, render: (row) => row.productCategory },
    { key: 'totalPackages', header: 'Total Products', align: 'right', sortable: true, sortValue: (row) => row.totalPackages, render: (row) => row.totalPackages.toLocaleString('en-IN') },
    { key: 'totalScans', header: 'Total Scans', align: 'right', sortable: true, sortValue: (row) => row.totalScans, render: (row) => row.totalScans.toLocaleString('en-IN') },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard label="Total Batches" value={productionBatchKpis.totalBatches} icon={<Inventory2Outlined size={20} />} iconColor="primary" />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard label="Active Batches" value={productionBatchKpis.activeBatches} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard label="Expired Batches" value={productionBatchKpis.expiredBatches} icon={<BlockOutlined size={20} />} iconColor="error" />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard label="Total Scans" value={productionBatchKpis.totalScans.toLocaleString('en-IN')} icon={<QrCode2Outlined size={20} />} iconColor="secondary" />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="production-batch-listing"
        columns={columns}
        rows={filteredBatches}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by batch no, product code or name…"
        searchKeys={(row) => `${row.batchNo} ${row.productCode} ${row.productName}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.category !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.batchNo ? 1 : 0) +
          (appliedFilters.manufacturingFrom || appliedFilters.manufacturingTo ? 1 : 0) +
          (appliedFilters.expiryFrom || appliedFilters.expiryTo ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="manufacturingDate"
        defaultSortDir="desc"
        actions={[
          { label: 'View Details', onClick: (row) => onViewBatch(row) },
        ]}
        emptyTitle="No batches found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<BatchListingFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Batches"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              label="Batch Number"
              size="small"
              value={draft.batchNo}
              onChange={(e) => setDraft((prev) => ({ ...prev, batchNo: e.target.value }))}
            />
            <TextField
              select
              label="Product Category"
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
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as BatchListingFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Manufacturing Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.manufacturingFrom}
              onChange={(e) => setDraft((prev) => ({ ...prev, manufacturingFrom: e.target.value }))}
            />
            <TextField
              type="date"
              label="Manufacturing Date To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.manufacturingTo}
              onChange={(e) => setDraft((prev) => ({ ...prev, manufacturingTo: e.target.value }))}
            />
            <TextField
              type="date"
              label="Expiry Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.expiryFrom}
              onChange={(e) => setDraft((prev) => ({ ...prev, expiryFrom: e.target.value }))}
            />
            <TextField
              type="date"
              label="Expiry Date To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.expiryTo}
              onChange={(e) => setDraft((prev) => ({ ...prev, expiryTo: e.target.value }))}
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
