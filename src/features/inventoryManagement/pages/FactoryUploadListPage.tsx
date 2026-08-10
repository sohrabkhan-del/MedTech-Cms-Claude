import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Grid, Stack, TextField, Typography } from '@mui/material'
import { Factory as FactoryOutlined, UploadCloud } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFactoryProductionUploadRowsList } from '@/features/inventoryManagement/hooks/useFactoryProductionUploadRowsList'
import type { FactoryProductionUploadRowRecord } from '@/types/factoryProductionUpload'

interface UploadRowFilters extends Record<string, unknown> {
  fromDate: string
  toDate: string
}

// Maps CommonTable column keys to the real GET /products/upload-rows `sortBy`
// field names. UNVERIFIED against the backend — best-effort guess based on
// the upload row's own field names.
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  productCode: 'ProductCode',
  batchNumber: 'BatchNo',
  batchDate: 'BatchIssuedDate',
  quantity: 'Qty',
  totalProducts: 'ProducedQty',
}

export function FactoryUploadListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<UploadRowFilters>({
    fromDate: '',
    toDate: '',
  })
  const [sortColumn, setSortColumn] = useState('batchDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { rows, totalItems, isLoading } = useFactoryProductionUploadRowsList({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch || undefined,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
    startDate: appliedFilters.fromDate || undefined,
    endDate: appliedFilters.toDate || undefined,
  })

  useRegionTopbarHeader({
    icon: <FactoryOutlined size={20} />,
    title: 'Active Product Registry Directory',
    subtitle:
      'Production batch imports from the manufacturing unit, with full traceability from factory to allocation.',
    isLoading,
  })

  const columns: CommonTableColumn<FactoryProductionUploadRowRecord>[] = [
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.ProductCode,
      render: (row) => row.ProductCode,
    },
    {
      key: 'batchNumber',
      header: 'Batch No.',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.BatchNo,
      render: (row) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{row.BatchNo}</Typography>
      ),
    },
    {
      key: 'productionPlanNumber',
      header: 'Production Plan No.',
      minWidth: 160,
      render: (row) => row.ProductionPlanNumber,
    },
    {
      key: 'batchDate',
      header: 'Batch Issued Date',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.BatchIssuedDate,
      render: (row) => row.BatchIssuedDate,
    },
    {
      key: 'issuedBy',
      header: 'Batch Issued By',
      minWidth: 130,
      render: (row) => row.BatchIssuedByName,
    },
    { key: 'month', header: 'Month', minWidth: 90, render: (row) => row.Month },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.Qty,
      render: (row) => row.Qty.toLocaleString('en-IN'),
    },
    {
      key: 'sampleQty',
      header: 'Sample Qty',
      align: 'center',
      minWidth: 100,
      render: (row) => row.SampleQty.toLocaleString('en-IN'),
    },
    {
      key: 'plugType',
      header: 'Plug Type',
      minWidth: 100,
      render: (row) => row.PlugType,
    },
    {
      key: 'domestic',
      header: 'Domestic',
      minWidth: 90,
      render: (row) => row.Domestic,
    },
    {
      key: 'export',
      header: 'Export',
      minWidth: 90,
      render: (row) => row.Export,
    },
    {
      key: 'batchCompletionDate',
      header: 'Batch Completed Date',
      minWidth: 150,
      render: (row) => row.BatchCompletedDate,
    },
    {
      key: 'totalProducts',
      header: 'Produced Qty',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.ProducedQty,
      render: (row) => row.ProducedQty.toLocaleString('en-IN'),
    },
    {
      key: 'startSerialNumber',
      header: 'Start Serial',
      align: 'center',
      minWidth: 110,
      render: (row) => row.StartSerialNumber,
    },
    {
      key: 'endSerialNumber',
      header: 'End Serial',
      align: 'center',
      minWidth: 110,
      render: (row) => row.EndSerialNumber,
    },
    {
      key: 'masterStartNumber',
      header: 'Master Carton Start No',
      align: 'center',
      minWidth: 150,
      render: (row) => row.MasterCartonStartNo,
    },
    {
      key: 'masterEndNumber',
      header: 'Master Carton End No',
      align: 'center',
      minWidth: 150,
      render: (row) => row.MasterCartonEndNo,
    },
  ]

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2.5,
        }}
      >
        <Button
          variant="contained"
          startIcon={<UploadCloud size={18} />}
          onClick={() => navigate('/inventory/factory-inventory-upload/new')}
        >
          Upload Inventory
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Rows"
              value={totalItems}
              icon={<FactoryOutlined size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="factory-upload-list"
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by product code or batch number…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0}
        onExportClick={() => {}}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        defaultSortBy="batchDate"
        defaultSortDir="desc"
        totalCount={totalItems}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        actions={[
          {
            label: 'View Batch',
            onClick: (row) =>
              navigate(`/inventory/factory-inventory-upload/upload/${row.uploadId}`),
          },
        ]}
        emptyTitle="No batches found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<UploadRowFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Batches"
        value={appliedFilters}
        onApply={(next) => {
          setAppliedFilters(next)
          setPage(0)
        }}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              type="date"
              label="Batch Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, fromDate: e.target.value }))
              }
            />
            <TextField
              type="date"
              label="Batch Date To"
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
