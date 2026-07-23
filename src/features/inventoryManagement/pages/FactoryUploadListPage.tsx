import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Factory as FactoryOutlined,
  Package as Inventory2Outlined,
  CircleCheck as CheckCircleOutlined,
  Ban as BlockOutlined,
  UploadCloud,
  X,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useIsMobile } from '@/hooks/useMediaQueryBreakpoint'
import { radius } from '@/theme/tokens'
import { BatchUidUploadTab } from '@/features/inventoryManagement/components/BatchUidUploadTab'
import { useFactoryUploads } from '@/features/inventoryManagement/hooks/useFactoryUploads'
import type { FactoryBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { BmrBatchRow, MappedBatch } from '@/types/batchUidUpload'

interface BatchFilters extends Record<string, unknown> {
  fromDate: string
  toDate: string
}

export function FactoryUploadListPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { batches, kpis, isLoading, importBmrUpload } = useFactoryUploads()
  const [filterOpen, setFilterOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<BatchFilters>({
    fromDate: '',
    toDate: '',
  })

  async function handleImported(
    batchRows: BmrBatchRow[],
    _mappedBatches: MappedBatch[],
    uploadFileName: string,
  ) {
    await importBmrUpload(batchRows, uploadFileName)
  }

  const factoryUploadKpis = kpis ?? {
    totalBatches: 0,
    totalContainers: 0,
    totalProducts: 0,
    totalAccepted: 0,
    totalRejected: 0,
  }

  const columns: CommonTableColumn<FactoryBatch>[] = [
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
      sortValue: (row) => row.batchNumber,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() =>
            navigate(`/inventory/factory-inventory-upload/${row.id}`)
          }
        >
          {row.batchNumber}
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
      render: (row) => row.batchDate,
    },
    {
      key: 'issuedBy',
      header: 'Batch Issued By',
      minWidth: 130,
      render: (row) => row.issuedBy,
    },
    { key: 'month', header: 'Month', minWidth: 90, render: (row) => row.month },
    {
      key: 'quantity',
      header: 'Qty',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.quantity,
      render: (row) => row.quantity.toLocaleString('en-IN'),
    },
    {
      key: 'retentionSampleQuantity',
      header: 'Sample Qty',
      align: 'right',
      minWidth: 100,
      render: (row) => row.retentionSampleQuantity.toLocaleString('en-IN'),
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
      minWidth: 100,
      render: (row) => row.domestic ?? '—',
    },
    {
      key: 'export',
      header: 'Export',
      minWidth: 100,
      render: (row) => row.export ?? '—',
    },
    {
      key: 'assemblyLine',
      header: 'Assy Line No.',
      minWidth: 110,
      render: (row) => row.assemblyLine,
    },
    {
      key: 'batchCompletionDate',
      header: 'Batch Completed Date',
      minWidth: 150,
      render: (row) => row.batchCompletionDate,
    },
    {
      key: 'totalProducts',
      header: 'Produced Qty',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.totalProducts,
      render: (row) => row.totalProducts.toLocaleString('en-IN'),
    },
    {
      key: 'startSerialNumber',
      header: 'Start Serial',
      minWidth: 110,
      render: (row) => row.startSerialNumber,
    },
    {
      key: 'endSerialNumber',
      header: 'End Serial',
      minWidth: 110,
      render: (row) => row.endSerialNumber,
    },
  ]

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
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
            <Typography variant="h1">
              Active Product Registry Directory
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Production batch imports from the manufacturing unit, with full
              traceability from factory to allocation.
            </Typography>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          startIcon={<UploadCloud size={18} />}
          onClick={() => setUploadOpen(true)}
        >
          Upload Manifest
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Batches"
              value={factoryUploadKpis.totalBatches}
              icon={<FactoryOutlined size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Containers"
              value={factoryUploadKpis.totalContainers}
              icon={<Inventory2Outlined size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Products"
              value={factoryUploadKpis.totalProducts.toLocaleString('en-IN')}
              icon={<CheckCircleOutlined size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Rejected"
              value={factoryUploadKpis.totalRejected}
              icon={<BlockOutlined size={20} />}
              iconColor="error"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="factory-upload-list"
        columns={columns}
        rows={batches}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by batch number…"
        searchKeys={(row) => row.batchNumber}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0}
        onExportClick={() => {}}
        defaultSortBy="batchDate"
        defaultSortDir="desc"
        actions={[
          {
            label: 'View Batch',
            onClick: (row) =>
              navigate(`/inventory/factory-inventory-upload/${row.id}`),
          },
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

      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        fullWidth
        fullScreen={isMobile}
        maxWidth="lg"
        slotProps={{
          paper: { sx: { borderRadius: isMobile ? 0 : `${radius.xl}px` } },
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
            Upload Manifest
          </Typography>
          <IconButton
            onClick={() => setUploadOpen(false)}
            size="small"
            aria-label="Close"
          >
            <X size={20} />
          </IconButton>
        </Stack>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <BatchUidUploadTab onImported={handleImported} />
        </DialogContent>
      </Dialog>
    </>
  )
}
