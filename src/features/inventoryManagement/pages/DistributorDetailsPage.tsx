import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Stack, Typography } from '@mui/material'
import { Truck, Package, Weight, Boxes } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useDistributorDetail } from '@/features/inventoryManagement/hooks/useDistributorDetail'
import type { DispatchLineItem } from '@/types/distributorUpload'

export function DistributorDetailsPage() {
  const navigate = useNavigate()
  const { distributorId } = useParams<{ distributorId: string }>()
  const { invoice, isLoading } = useDistributorDetail(distributorId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={3} />
  }

  if (!invoice) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This dispatch invoice may have been removed."
        actionLabel="Back to Distributor Upload"
        onAction={() => navigate('/distributor-upload')}
      />
    )
  }

  const totalCartonWeight = invoice.lineItems.reduce(
    (sum, item) => sum + item.cartonWeight,
    0,
  )
  const totalDispatchQty = invoice.lineItems.reduce(
    (sum, item) => sum + item.dispatchQty,
    0,
  )

  const lineItemColumns: CommonTableColumn<DispatchLineItem>[] = [
    {
      key: 'srNo',
      header: 'Sr. No.',
      align: 'center',
      minWidth: 70,
      sortable: true,
      sortValue: (row) => row.srNo,
      render: (row) => row.srNo,
    },
    {
      key: 'itemCode',
      header: 'Item Code',
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.itemCode,
      render: (row) => row.itemCode,
    },
    {
      key: 'itemName',
      header: 'Item Name',
      minWidth: 260,
      render: (row) => row.itemName,
    },
    {
      key: 'cartonNo',
      header: 'Carton No.',
      align: 'center',
      minWidth: 110,
      sortable: true,
      sortValue: (row) => row.cartonNo,
      render: (row) => row.cartonNo,
    },
    {
      key: 'cartonWeight',
      header: 'Carton Weight',
      align: 'center',
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.cartonWeight,
      render: (row) => row.cartonWeight.toFixed(2),
    },
    {
      key: 'dispatchQty',
      header: 'Dispatch Qty',
      align: 'center',
      minWidth: 110,
      sortable: true,
      sortValue: (row) => row.dispatchQty,
      render: (row) => row.dispatchQty,
    },
  ]

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <Truck size={22} />
          </Box>
          <Box>
            <Typography variant="h1">{invoice.customerName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {invoice.invoiceNo} · {invoice.date}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Transporter"
            value={invoice.transporter}
            icon={<Truck size={20} />}
            iconColor="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Box Qty"
            value={invoice.totalBoxQty}
            icon={<Boxes size={20} />}
            iconColor="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Carton Weight"
            value={totalCartonWeight.toFixed(2)}
            icon={<Weight size={20} />}
            iconColor="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total Dispatch Qty"
            value={totalDispatchQty}
            icon={<Package size={20} />}
            iconColor="success"
          />
        </Grid>
      </Grid>

      <SectionCard title="Dispatch Loading Report">
        <DetailFieldGrid
          fields={[
            { label: 'Customer Name', value: invoice.customerName },
            { label: 'Invoice No.', value: invoice.invoiceNo },
            { label: 'Transporter', value: invoice.transporter },
            { label: 'Total Box Qty', value: invoice.totalBoxQty },
            { label: 'Vehicle No.', value: invoice.vehicleNo || '—' },
            { label: 'Date', value: invoice.date },
            { label: 'Format No.', value: invoice.formatNo },
            { label: 'Rev. No.', value: invoice.revNo },
            { label: 'Rev. Date', value: invoice.revDate },
          ]}
        />
      </SectionCard>

      <SectionCard title="Item-wise Carton Listing">
        <CommonTable
          tableKey="dispatch-invoice-line-items"
          columns={lineItemColumns}
          rows={invoice.lineItems}
          loading={isLoading}
          getRowId={(row) => row.id}
          searchPlaceholder="Search by item code, name or carton no…"
          searchKeys={(row) => `${row.itemCode} ${row.itemName} ${row.cartonNo}`}
          defaultSortBy="srNo"
          emptyTitle="No line items on this invoice"
        />
      </SectionCard>
    </Stack>
  )
}
