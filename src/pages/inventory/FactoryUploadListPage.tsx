import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, Stack, TextField, Typography } from '@mui/material'
import {
  Factory as FactoryOutlined,
  Package as Inventory2Outlined,
  CircleCheck as CheckCircleOutlined,
  Ban as BlockOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { mockFactoryBatches, factoryUploadKpis } from '@/features/inventory/mockFactoryUploads'
import type { FactoryBatch } from '@/types/factoryUpload'

interface BatchFilters extends Record<string, unknown> {
  fromDate: string
  toDate: string
}

export function FactoryUploadListPage() {
  const navigate = useNavigate()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<BatchFilters>({ fromDate: '', toDate: '' })

  const filteredBatches = useMemo(() => mockFactoryBatches, [])

  const columns: CommonTableColumn<FactoryBatch>[] = [
    {
      key: 'batchName',
      header: 'Batch Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.batchName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/inventory/factory-inventory-upload/${row.id}`)}
        >
          {row.batchName}
        </Typography>
      ),
    },
    { key: 'batchNumber', header: 'Batch Number', minWidth: 120, render: (row) => row.batchNumber },
    { key: 'batchDate', header: 'Batch Date', minWidth: 120, sortable: true, render: (row) => row.batchDate },
    {
      key: 'quantity',
      header: 'Quantity',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.quantity,
      render: (row) => row.quantity.toLocaleString('en-IN'),
    },
    { key: 'startSerialNumber', header: 'Start Serial Number', minWidth: 140, render: (row) => row.startSerialNumber },
    { key: 'endSerialNumber', header: 'End Serial Number', minWidth: 140, render: (row) => row.endSerialNumber },
    { key: 'masterStartNumber', header: 'Master Start Number', minWidth: 150, render: (row) => row.masterStartNumber },
    { key: 'masterEndNumber', header: 'Master End Number', minWidth: 150, render: (row) => row.masterEndNumber },
    {
      key: 'totalContainers',
      header: 'Total Containers',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.totalContainers,
      render: (row) => row.totalContainers,
    },
    {
      key: 'totalProducts',
      header: 'Total Products',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.totalProducts,
      render: (row) => row.totalProducts.toLocaleString('en-IN'),
    },
  ]

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Stack
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.light',
            color: 'primary.main',
          }}
        >
          <FactoryOutlined size={20} />
        </Stack>
        <Stack>
          <Typography variant="h1">Active Product Registry Directory</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Production batch imports from the manufacturing unit, with full traceability from factory to allocation.
          </Typography>
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Batches" value={factoryUploadKpis.totalBatches} icon={<FactoryOutlined size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Containers" value={factoryUploadKpis.totalContainers} icon={<Inventory2Outlined size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Products" value={factoryUploadKpis.totalProducts.toLocaleString('en-IN')} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Rejected" value={factoryUploadKpis.totalRejected} icon={<BlockOutlined size={20} />} iconColor="error" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="factory-upload-list"
        columns={columns}
        rows={filteredBatches}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by batch name or number…"
        searchKeys={(row) => `${row.batchName} ${row.batchNumber}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0}
        onExportClick={() => {}}
        createAction={{ label: 'Upload Manifest', to: '/inventory/factory-inventory-upload/new' }}
        defaultSortBy="batchDate"
        defaultSortDir="desc"
        actions={[
          { label: 'View Batch', onClick: (row) => navigate(`/inventory/factory-inventory-upload/${row.id}`) },
          { label: 'Delete Batch', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No batches found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<BatchFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Batches"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              type="date"
              label="Batch Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Batch Date To"
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
