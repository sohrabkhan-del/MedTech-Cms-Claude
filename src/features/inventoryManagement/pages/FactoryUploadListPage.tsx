import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Grid, Stack, TextField, Typography } from '@mui/material'
import {
  Factory as FactoryOutlined,
  Package as Inventory2Outlined,
  CircleCheck as CheckCircleOutlined,
  Ban as BlockOutlined,
  UploadCloud,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useFactoryUploads } from '@/features/inventoryManagement/hooks/useFactoryUploads'
import type { FactoryBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'

interface BatchFilters extends Record<string, unknown> {
  fromDate: string
  toDate: string
}

export function FactoryUploadListPage() {
  const navigate = useNavigate()
  const { batches, kpis, isLoading } = useFactoryUploads()
  const [filterOpen, setFilterOpen] = useState(false)
  const [statFilter, setStatFilter] = useState<'all' | 'containers' | 'rejected'>('all')
  const [appliedFilters, setAppliedFilters] = useState<BatchFilters>({
    fromDate: '',
    toDate: '',
  })

  const factoryUploadKpis = kpis ?? {
    totalBatches: 0,
    totalContainers: 0,
    totalProducts: 0,
    totalAccepted: 0,
    totalRejected: 0,
  }

  const displayedBatches = useMemo(() => {
    if (statFilter === 'containers') return batches.filter((b) => b.totalContainers > 0)
    if (statFilter === 'rejected') return batches.filter((b) => b.totalRejected > 0)
    return batches
  }, [batches, statFilter])

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
      align: 'center',
      sortable: true,
      sortValue: (row) => row.quantity,
      render: (row) => row.quantity.toLocaleString('en-IN'),
    },
    {
      key: 'retentionSampleQuantity',
      header: 'Sample Qty',
      align: 'center',
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
      key: 'batchCompletionDate',
      header: 'Batch Completed Date',
      minWidth: 150,
      render: (row) => row.batchCompletionDate,
    },
    {
      key: 'totalProducts',
      header: 'Produced Qty',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.totalProducts,
      render: (row) => row.totalProducts.toLocaleString('en-IN'),
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
      header: 'Master Start Serial No',
      align: 'center',
      minWidth: 150,
      render: (row) => row.masterStartNumber,
    },
    {
      key: 'masterEndNumber',
      header: 'Master End Serial No',
      align: 'center',
      minWidth: 150,
      render: (row) => row.masterEndNumber,
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
          onClick={() =>
            navigate('/inventory/factory-inventory-upload/upload-bmr')
          }
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
              label="Total Batches"
              value={factoryUploadKpis.totalBatches}
              icon={<FactoryOutlined size={20} />}
              iconColor="primary"
              onClick={() => setStatFilter('all')}
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
              onClick={() => setStatFilter('containers')}
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
              onClick={() => setStatFilter('all')}
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
              onClick={() => setStatFilter('rejected')}
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="factory-upload-list"
        columns={columns}
        rows={displayedBatches}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by batch number…"
        searchKeys={(row) => row.batchNumber}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0) +
          (statFilter !== 'all' ? 1 : 0)
        }
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
        emptyTitle={
          statFilter === 'containers'
            ? 'No batches with containers packed yet'
            : statFilter === 'rejected'
              ? 'No rejected batches'
              : 'No batches found'
        }
        emptyDescription={
          statFilter === 'all'
            ? 'Try adjusting your filters or search terms.'
            : 'Try a different stat card or clear the filter.'
        }
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
    </>
  )
}
