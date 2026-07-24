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
import type { DispatchInvoice } from '@/types/distributorUpload'

interface DispatchListingFilters extends Record<string, unknown> {
  customerName: string
  transporter: string
}

interface DistributorListingTabProps {
  distributors: DispatchInvoice[]
  isLoading: boolean
}

export function DistributorListingTab({
  distributors,
  isLoading,
}: DistributorListingTabProps) {
  const navigate = useNavigate()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<DispatchListingFilters>({
    customerName: '',
    transporter: '',
  })

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
      render: (row) => row.date,
    },
  ]

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
        ]}
        onExportClick={() => {}}
        defaultSortBy="date"
        defaultSortDir="desc"
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
    </>
  )
}
