import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Grid, Stack, TextField, Typography } from '@mui/material'
import { Factory as FactoryOutlined, Layers, UploadCloud } from 'lucide-react'
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
import { useGetFactoryInventoryUploadKpisQuery } from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { formatDate } from '@/utils/formatDate'
import type { FactoryProductionUploadRowRecord } from '@/types/factoryProductionUpload'

interface UploadRowFilters extends Record<string, unknown> {
  fromDate: string
  toDate: string
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

const DATE_PRESETS: {
  label: string
  getRange: () => { fromDate: string; toDate: string }
}[] = [
  {
    label: 'Today',
    getRange: () => {
      const today = toIsoDate(new Date())
      return { fromDate: today, toDate: today }
    },
  },
  {
    label: 'Last 7 Days',
    getRange: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 6)
      return { fromDate: toIsoDate(from), toDate: toIsoDate(to) }
    },
  },
  {
    label: 'Last 30 Days',
    getRange: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 29)
      return { fromDate: toIsoDate(from), toDate: toIsoDate(to) }
    },
  },
  {
    label: 'This Month',
    getRange: () => {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { fromDate: toIsoDate(from), toDate: toIsoDate(now) }
    },
  },
]

// Maps CommonTable column keys to the real GET /products/upload-rows `sortBy`
// field names, per the swagger schema (camelCase).
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  productCode: 'productCode',
  batchNumber: 'batchNo',
  batchDate: 'batchIssuedDate',
  quantity: 'qty',
  totalProducts: 'producedQty',
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

  const { data: kpis, isLoading: isKpisLoading } =
    useGetFactoryInventoryUploadKpisQuery()

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
      sortValue: (row) => row.productCode,
      render: (row) => row.productCode,
    },
    {
      key: 'batchNumber',
      header: 'Batch No.',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.batchNo,
      render: (row) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
          {row.batchNo}
        </Typography>
      ),
    },
    {
      key: 'productionPlanNumber',
      header: 'Production Plan No.',
      minWidth: 160,
      render: (row) => row.productionPlanNumber,
    },
    {
      key: 'batchDate',
      header: 'Batch Issued Date',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.batchIssuedDate,
      render: (row) => formatDate(row.batchIssuedDate),
    },
    {
      key: 'issuedBy',
      header: 'Batch Issued By',
      minWidth: 130,
      render: (row) => row.batchIssuedByName,
    },
    { key: 'month', header: 'Month', minWidth: 90, render: (row) => row.month },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.qty,
      render: (row) => row.qty?.toLocaleString('en-IN') ?? '-',
    },
    {
      key: 'sampleQty',
      header: 'Sample Qty',
      align: 'center',
      minWidth: 100,
      render: (row) => row.sampleQty?.toLocaleString('en-IN') ?? '-',
    },
    {
      key: 'plugType',
      header: 'Plug Type',
      minWidth: 100,
      render: (row) => row.plugType,
    },
    {
      key: 'domestic',
      header: 'Domestic',
      minWidth: 90,
      render: (row) => row.domestic,
    },
    {
      key: 'export',
      header: 'Export',
      minWidth: 90,
      render: (row) => row.export,
    },
    {
      key: 'batchCompletionDate',
      header: 'Batch Completed Date',
      minWidth: 150,
      render: (row) => formatDate(row.batchCompletedDate),
    },
    {
      key: 'totalProducts',
      header: 'Produced Qty',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.producedQty,
      render: (row) => row.producedQty?.toLocaleString('en-IN') ?? '-',
    },
    {
      key: 'startSerialNumber',
      header: 'Start Serial',
      align: 'center',
      minWidth: 110,
      render: (row) => row.startSerialNumber,
    },
    {
      key: 'endSerialNumber',
      header: 'End Serial',
      align: 'center',
      minWidth: 110,
      render: (row) => row.endSerialNumber,
    },
    {
      key: 'masterStartNumber',
      header: 'Master Carton Start No',
      align: 'center',
      minWidth: 150,
      render: (row) => row.masterCartonStartNo,
    },
    {
      key: 'masterEndNumber',
      header: 'Master Carton End No',
      align: 'center',
      minWidth: 150,
      render: (row) => row.masterCartonEndNo,
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
          variant="outlined"
          startIcon={<Layers size={18} />}
          onClick={() =>
            navigate('/inventory/factory-inventory-upload/uploads')
          }
        >
          Uploaded Inventory
        </Button>
        <Button
          variant="contained"
          startIcon={<UploadCloud size={18} />}
          onClick={() =>
            navigate('/inventory/factory-inventory-upload/upload-bmr')
          }
        >
          Upload Inventory
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Batches"
              value={kpis?.totalBatches ?? 0}
              icon={<FactoryOutlined size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Uploads"
              value={kpis?.totalUploads ?? 0}
              icon={<UploadCloud size={20} />}
              iconColor="secondary"
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
        onRowClick={(row) =>
          navigate(
            `/inventory/factory-inventory-upload/upload/${row.uploadBatchId}`,
          )
        }
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
              navigate(
                `/inventory/factory-inventory-upload/upload/${row.uploadBatchId}`,
              ),
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
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', rowGap: 1 }}
            >
              {DATE_PRESETS.map((preset) => {
                const range = preset.getRange()
                const selected =
                  draft.fromDate === range.fromDate &&
                  draft.toDate === range.toDate
                return (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    size="small"
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    onClick={() => setDraft((prev) => ({ ...prev, ...range }))}
                  />
                )
              })}
            </Stack>
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
