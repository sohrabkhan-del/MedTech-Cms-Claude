import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Factory as FactoryOutlined,
  Trash2 as DeleteOutlined,
} from 'lucide-react'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import {
  useDeleteFactoryProductionUploadBatchMutation,
  useGetFactoryProductionUploadBatchesQuery,
} from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { formatExactDateTime } from '@/utils/formatLastUpdated'
import type { FactoryProductionUploadBatchSummary } from '@/types/factoryProductionUpload'

interface BatchFilters extends Record<string, unknown> {
  fromDate: string
  toDate: string
}

function toDate(value: string): Date {
  return new Date(value)
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

export function FactoryUploadBatchListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<BatchFilters>({
    fromDate: '',
    toDate: '',
  })

  const { data, isFetching } = useGetFactoryProductionUploadBatchesQuery({
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
    startDate: appliedFilters.fromDate || undefined,
    endDate: appliedFilters.toDate || undefined,
  })
  const [deleteBatch, { isLoading: isDeleting }] =
    useDeleteFactoryProductionUploadBatchMutation()

  const [batchToDelete, setBatchToDelete] =
    useState<FactoryProductionUploadBatchSummary | null>(null)

  const batches = data?.items ?? []

  const openDetail = (id: string) =>
    navigate(`/inventory/factory-inventory-upload/upload/${id}`)

  const openScans = (id: string) =>
    navigate(`/inventory/factory-inventory-upload/upload/${id}/scans`)

  const handleConfirmDelete = async () => {
    if (!batchToDelete) return
    try {
      await deleteBatch(batchToDelete.id).unwrap()
      toast.success('Upload batch and its products were deleted.')
      setBatchToDelete(null)
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to delete upload batch.'))
    }
  }

  const columns: CommonTableColumn<FactoryProductionUploadBatchSummary>[] = [
    {
      key: 'fileName',
      header: 'Filename',
      minWidth: 200,
      align: 'center',
      render: (row) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => openScans(row.id)}
        >
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {String(
              (row as any).fileName ?? (row as any).uploadFileName ?? '-',
            ) || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'totalRows',
      header: 'Total Products',
      align: 'center',
      minWidth: 110,
      render: (row) => row.totalRows.toLocaleString('en-IN'),
    },

    {
      key: 'createdAt',
      header: 'Uploaded At',
      minWidth: 180,
      render: (row) => formatExactDateTime(toDate(row.createdAt)),
    },
  ]

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <FactoryOutlined size={20} />
          </Box>
          <Box>
            <Typography variant="h1">Inventory Excel Upload list</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Every factory production upload batch. Deleting a batch removes
              all products imported from it.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <CommonTable
        tableKey="factory-upload-batches"
        columns={columns}
        rows={batches}
        loading={isFetching}
        getRowId={(row) => row.id}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}

        onFilterClick={() => setFilterOpen(true)}
        filterCount={appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0}
        actions={[
          { label: 'Scan Details', onClick: (row) => openDetail(row.id) },
          { label: 'Upload Details', onClick: (row) => openScans(row.id) },
          {
            label: 'Delete',
            onClick: (row) => setBatchToDelete(row),
            danger: true,
          },
        ]}
        totalCount={data?.total ?? 0}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        rowsPerPageOptions={[10, 20, 50]}
        emptyTitle="No upload batches found"
        emptyDescription="Uploaded production batches will appear here."
      />

      <Dialog
        open={!!batchToDelete}
        onClose={() => (isDeleting ? undefined : setBatchToDelete(null))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutlined size={20} />
          Delete upload batch?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.875rem' }}>
            This permanently deletes the entire upload batch and all{' '}
            <strong>
              {batchToDelete?.totalRows.toLocaleString('en-IN') ?? 0}
            </strong>{' '}
            product row(s) imported from it. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBatchToDelete(null)}
            disabled={isDeleting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            variant="contained"
            color="error"
            startIcon={<DeleteOutlined size={18} />}
          >
            {isDeleting ? 'Deleting…' : 'Delete Batch'}
          </Button>
        </DialogActions>
      </Dialog>

      <FilterDrawer<BatchFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Uploads"
        value={appliedFilters}
        onApply={(next) => {
          setAppliedFilters(next)
          setPage(0)
        }}
        onReset={() => {
          setAppliedFilters({ fromDate: '', toDate: '' })
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
              label="Uploaded From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, fromDate: e.target.value }))
              }
            />
            <TextField
              type="date"
              label="Uploaded To"
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
