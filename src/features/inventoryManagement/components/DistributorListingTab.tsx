import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, Stack, TextField, Typography } from '@mui/material'
import { Truck, FileText, Package } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { Modal } from '@/components/common/Modal/Modal'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { useDeleteDistributorMutation } from '@/features/inventoryManagement/services/distributorUploadApi'
import type { DispatchInvoice } from '@/types/distributorUpload'
import type { SortDirection } from '@/components/common/CommonTable/CommonTable'

interface DispatchListingFilters extends Record<string, unknown> {
  customerName: string
  transporter: string
}

// Maps CommonTable column keys to API sortBy field names
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  date: 'date',
  invoiceNo: 'invoiceNo',
  customerName: 'customerName',
  transporter: 'transporter',
  totalBoxQty: 'totalBoxQty',
}

interface DistributorListingTabProps {
  distributors: DispatchInvoice[]
  totalCount: number
  isLoading: boolean
  page: number
  rowsPerPage: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onSortChange: (sortBy: string, sortDir: SortDirection) => void
}

export function DistributorListingTab({
  distributors,
  totalCount,
  isLoading,
  page,
  rowsPerPage,
  sortBy,
  sortOrder,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
}: DistributorListingTabProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<DispatchListingFilters>({
    customerName: '',
    transporter: '',
  })
  const [deleteTarget, setDeleteTarget] = useState<DispatchInvoice | null>(null)
  const [deleteDistributor, { isLoading: isDeleting }] =
    useDeleteDistributorMutation()

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deleteDistributor(deleteTarget.distributorId).unwrap()
      toast.success(`${deleteTarget.customerName} deleted successfully.`)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete distributor.'))
    } finally {
      setDeleteTarget(null)
    }
  }

  const totalBoxes = useMemo(
    () => distributors.reduce((sum, invoice) => sum + invoice.totalBoxQty, 0),
    [distributors],
  )

  const filteredInvoices = useMemo(
    () =>
      distributors.filter((invoice) => {
        const customerMatch =
          !appliedFilters.customerName ||
          invoice.customerName
            .toLowerCase()
            .includes(appliedFilters.customerName.toLowerCase())
        const transporterMatch =
          !appliedFilters.transporter ||
          invoice.transporter
            .toLowerCase()
            .includes(appliedFilters.transporter.toLowerCase())
        return customerMatch && transporterMatch
      }),
    [distributors, appliedFilters],
  )

  const columns: CommonTableColumn<DispatchInvoice>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice No.',
      minWidth: 150,
      sortable: true,
      sortValue: (row) => row.invoiceNo,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/distributor-upload/${row.id}`)}
        >
          {row.invoiceNo}
        </Typography>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer Name',
      minWidth: 190,
      sortable: true,
      sortValue: (row) => row.customerName,
      render: (row) => row.customerName,
    },
    {
      key: 'transporter',
      header: 'Transporter',
      minWidth: 170,
      sortable: true,
      sortValue: (row) => row.transporter,
      render: (row) => row.transporter,
    },
    {
      key: 'totalBoxQty',
      header: 'Total Box Qty',
      align: 'center',
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.totalBoxQty,
      render: (row) => row.totalBoxQty.toLocaleString('en-IN'),
    },
    {
      key: 'vehicleNo',
      header: 'Vehicle No.',
      minWidth: 130,
      render: (row) => row.vehicleNo || '—',
    },
    {
      key: 'date',
      header: 'Date',
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.uploadedDate,
      render: (row) => row.date,
    },
  ]

  function handleSortChange(columnKey: string, dir: SortDirection) {
    const apiField = SORT_FIELD_MAP[columnKey] ?? columnKey
    onSortChange(apiField, dir)
  }

  // Derive the current sort column key from the API sortBy field (reverse map)
  const currentSortColumnKey =
    Object.entries(SORT_FIELD_MAP).find(([, v]) => v === sortBy)?.[0] ?? sortBy

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Invoices"
              value={distributors.length}
              icon={<FileText size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Box Qty"
              value={totalBoxes.toLocaleString('en-IN')}
              icon={<Package size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Transporters Used"
              value={new Set(distributors.map((d) => d.transporter)).size}
              icon={<Truck size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="distributor-listing"
        columns={columns}
        rows={filteredInvoices}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by customer name, invoice no. or transporter…"
        searchKeys={(row) =>
          `${row.customerName} ${row.invoiceNo} ${row.transporter}`
        }
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.customerName ? 1 : 0) +
          (appliedFilters.transporter ? 1 : 0)
        }
        actions={[
          {
            label: 'View Details',
            onClick: (row) => navigate(`/distributor-upload/${row.id}`),
          },
          {
            label: 'Delete',
            danger: true,
            onClick: (row) => setDeleteTarget(row),
          },
        ]}
        onExportClick={() => {}}
        onSortChange={handleSortChange}
        defaultSortBy={currentSortColumnKey}
        defaultSortDir={sortOrder}
        totalCount={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50]}
        emptyTitle={
          distributors.length === 0
            ? 'No dispatch invoices uploaded yet'
            : 'No invoices found'
        }
        emptyDescription={
          distributors.length === 0
            ? 'Use "Upload Distributor Batches" to import a dispatch loading report.'
            : 'Try adjusting your filters or search terms.'
        }
      />

      <FilterDrawer<DispatchListingFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Invoices"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              label="Customer Name"
              size="small"
              value={draft.customerName}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, customerName: e.target.value }))
              }
            />
            <TextField
              label="Transporter"
              size="small"
              value={draft.transporter}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, transporter: e.target.value }))
              }
            />
          </Stack>
        )}
      </FilterDrawer>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Distributor"
        description={`This will permanently delete "${deleteTarget?.customerName}" and cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={() => void handleDeleteConfirm()}
        loading={isDeleting}
        maxWidth="sm"
      >
        <div />
      </Modal>
    </>
  )
}
