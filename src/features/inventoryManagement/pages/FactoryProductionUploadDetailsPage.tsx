import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Stack, TextField, Typography } from '@mui/material'
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
import { useFactoryProductionUploadRows } from '@/features/inventoryManagement/hooks/useFactoryProductionUploadRows'
import type { FactoryProductionUploadRowRecord } from '@/types/factoryProductionUpload'

const rowColumns: CommonTableColumn<FactoryProductionUploadRowRecord>[] = [
  { key: 'ProductCode', header: 'Product Code', minWidth: 130, render: (row) => row.ProductCode },
  { key: 'BatchNo', header: 'Batch No.', minWidth: 160, render: (row) => row.BatchNo },
  {
    key: 'ProductionPlanNumber',
    header: 'Production Plan No.',
    minWidth: 160,
    render: (row) => row.ProductionPlanNumber,
  },
  { key: 'BatchIssuedDate', header: 'Batch Issued Date', minWidth: 130, render: (row) => row.BatchIssuedDate },
  { key: 'BatchIssuedByName', header: 'Batch Issued By', minWidth: 130, render: (row) => row.BatchIssuedByName },
  { key: 'Month', header: 'Month', minWidth: 90, render: (row) => row.Month },
  { key: 'Qty', header: 'Qty', align: 'center', render: (row) => row.Qty.toLocaleString('en-IN') },
  {
    key: 'SampleQty',
    header: 'Sample Qty',
    align: 'center',
    minWidth: 100,
    render: (row) => row.SampleQty.toLocaleString('en-IN'),
  },
  { key: 'PlugType', header: 'Plug Type', minWidth: 100, render: (row) => row.PlugType },
  { key: 'Domestic', header: 'Domestic', minWidth: 90, render: (row) => row.Domestic },
  { key: 'Export', header: 'Export', minWidth: 90, render: (row) => row.Export },
  { key: 'AssyLineNo', header: 'Assy Line No.', minWidth: 110, render: (row) => row.AssyLineNo },
  {
    key: 'BatchCompletedDate',
    header: 'Batch Completed Date',
    minWidth: 150,
    render: (row) => row.BatchCompletedDate,
  },
  {
    key: 'ProducedQty',
    header: 'Produced Qty',
    align: 'center',
    minWidth: 110,
    render: (row) => row.ProducedQty.toLocaleString('en-IN'),
  },
  { key: 'StartSerialNumber', header: 'Start Serial', align: 'center', render: (row) => row.StartSerialNumber },
  { key: 'EndSerialNumber', header: 'End Serial', align: 'center', render: (row) => row.EndSerialNumber },
  {
    key: 'MasterCartonStartNo',
    header: 'Master Carton Start No',
    align: 'center',
    minWidth: 150,
    render: (row) => row.MasterCartonStartNo,
  },
  {
    key: 'MasterCartonEndNo',
    header: 'Master Carton End No',
    align: 'center',
    minWidth: 150,
    render: (row) => row.MasterCartonEndNo,
  },
]

export function FactoryProductionUploadDetailsPage() {
  const navigate = useNavigate()
  const { uploadId } = useParams<{ uploadId: string }>()
  const { batch, isLoading, error } = useFactoryProductionUploadDetail(uploadId)

  const [batchNoQuery, setBatchNoQuery] = useState('')
  const { rows, isFetching: areRowsLoading } = useFactoryProductionUploadRows(batchNoQuery)

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
            <Typography variant="h1">{batch.uploadFileName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {batch.uploadedAt}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Upload ID', value: batch.id },
              { label: 'File Name', value: batch.uploadFileName },
              { label: 'Uploaded At', value: batch.uploadedAt },
              { label: 'Total Rows', value: batch.totalRows },
            ]}
          />
        </SectionCard>

        <SectionCard title="Look Up Batch Rows">
          <Stack spacing={2}>
            <TextField
              label="Batch No."
              size="small"
              placeholder="e.g. S0H6-2-2504-00023"
              value={batchNoQuery}
              onChange={(e) => setBatchNoQuery(e.target.value)}
              sx={{ maxWidth: 320 }}
            />
            <CommonTable
              tableKey="factory-production-upload-rows"
              columns={rowColumns}
              rows={rows}
              loading={areRowsLoading}
              getRowId={(row) => row.id}
              searchPlaceholder="Search rows…"
              searchKeys={(row) => `${row.ProductCode} ${row.BatchNo}`}
              emptyTitle={
                batchNoQuery ? 'No rows found for this batch number' : 'Enter a batch number to look up its rows'
              }
            />
          </Stack>
        </SectionCard>
      </Stack>
    </>
  )
}
