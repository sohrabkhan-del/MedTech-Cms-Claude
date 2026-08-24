import { useNavigate, useParams } from 'react-router-dom'
import { Box, Stack, Typography } from '@mui/material'
import { Factory as FactoryOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useFactoryProductionUploadDetail } from '@/features/inventoryManagement/hooks/useFactoryProductionUploadDetail'
import { formatDate } from '@/utils/formatDate'
import type { FactoryProductionUploadRowRecord } from '@/types/factoryProductionUpload'

const rowColumns: CommonTableColumn<FactoryProductionUploadRowRecord>[] = [
  { key: 'productCode', header: 'Product Code', minWidth: 130, render: (row) => row.productCode },
  {
    key: 'batchNo',
    header: 'Batch No.',
    minWidth: 160,
    sortable: true,
    sortValue: (row) => row.batchNo,
    render: (row) => (
      <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{row.batchNo}</Typography>
    ),
  },
  {
    key: 'productionPlanNumber',
    header: 'Production Plan No.',
    minWidth: 160,
    render: (row) => row.productionPlanNumber,
  },
  {
    key: 'batchIssuedDate',
    header: 'Batch Issued Date',
    minWidth: 130,
    sortable: true,
    sortValue: (row) => row.batchIssuedDate,
    render: (row) => formatDate(row.batchIssuedDate),
  },
  { key: 'batchIssuedByName', header: 'Batch Issued By', minWidth: 130, render: (row) => row.batchIssuedByName },
  { key: 'month', header: 'Month', minWidth: 90, render: (row) => row.month },
  {
    key: 'qty',
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
  { key: 'plugType', header: 'Plug Type', minWidth: 100, render: (row) => row.plugType },
  { key: 'domestic', header: 'Domestic', minWidth: 90, render: (row) => row.domestic },
  { key: 'export', header: 'Export', minWidth: 90, render: (row) => row.export },
  { key: 'assyLineNo', header: 'Assy Line No.', minWidth: 110, render: (row) => row.assyLineNo || '-' },
  {
    key: 'batchCompletedDate',
    header: 'Batch Completed Date',
    minWidth: 150,
    render: (row) => formatDate(row.batchCompletedDate),
  },
  {
    key: 'producedQty',
    header: 'Produced Qty',
    align: 'center',
    minWidth: 110,
    sortable: true,
    sortValue: (row) => row.producedQty,
    render: (row) => row.producedQty?.toLocaleString('en-IN') ?? '-',
  },
  { key: 'startSerialNumber', header: 'Start Serial', align: 'center', minWidth: 110, render: (row) => row.startSerialNumber },
  { key: 'endSerialNumber', header: 'End Serial', align: 'center', minWidth: 110, render: (row) => row.endSerialNumber },
  {
    key: 'masterCartonStartNo',
    header: 'Master Carton Start No',
    align: 'center',
    minWidth: 150,
    render: (row) => row.masterCartonStartNo,
  },
  {
    key: 'masterCartonEndNo',
    header: 'Master Carton End No',
    align: 'center',
    minWidth: 150,
    render: (row) => row.masterCartonEndNo,
  },
]

export function FactoryProductionUploadDetailsPage() {
  const navigate = useNavigate()
  const { uploadId } = useParams<{ uploadId: string }>()
  const { batch, isLoading, error } = useFactoryProductionUploadDetail(uploadId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={2} />
  }

  if (!batch || error) {
    return (
      <EmptyState
        title="Upload not found"
        description={error ?? 'This upload may have been removed.'}
        actionLabel="Back to Factory Inventory Upload"
        onAction={() => navigate('/inventory/factory-inventory-upload')}
      />
    )
  }

  const rows = batch.rows ?? []

  return (
    <>
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}
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
            <Typography variant="h1">Upload Batch</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Uploaded {formatDate(batch.createdAt)} · {batch.totalRows.toLocaleString('en-IN')} row(s)
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Upload ID', value: batch.id },
              { label: 'Total Rows', value: batch.totalRows.toLocaleString('en-IN') },
              { label: 'Uploaded At', value: formatDate(batch.createdAt) },
              { label: 'Last Updated', value: formatDate(batch.updatedAt) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Batch Rows">
          <CommonTable
            tableKey="factory-production-upload-rows"
            columns={rowColumns}
            rows={rows}
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search by product code or batch number…"
            searchKeys={(row) =>
              `${row.productCode} ${row.batchNo} ${row.productionPlanNumber}`
            }
            emptyTitle="No rows in this upload"
            emptyDescription="This upload batch does not contain any rows."
          />
        </SectionCard>
      </Stack>
    </>
  )
}
