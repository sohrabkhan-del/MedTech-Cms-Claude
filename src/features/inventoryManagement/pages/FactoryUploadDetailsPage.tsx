import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import {
  Factory as FactoryOutlined,
  Trash2 as DeleteOutlined,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useFactoryBatchDetail } from '@/features/inventoryManagement/hooks/useFactoryBatchDetail'
import { getChemistByShopName } from '@/features/userManagement/mockChemists'
import { getDealerByShopName } from '@/features/userManagement/mockDealers'
import type { BatchScanEntry } from '@/features/inventoryManagement/types/inventoryManagement.types'

function PartnerNameCell({
  name,
  onClick,
}: {
  name: string
  onClick?: () => void
}) {
  if (name === '—' || !onClick) return <>{name}</>
  return (
    <Typography
      component="span"
      sx={{
        fontSize: 'inherit',
        fontWeight: 'inherit',
        cursor: 'pointer',
        '&:hover': { textDecoration: 'underline' },
      }}
      onClick={onClick}
    >
      {name}
    </Typography>
  )
}

function buildScanColumns(
  navigate: ReturnType<typeof useNavigate>,
): CommonTableColumn<BatchScanEntry>[] {
  return [
    {
      key: 'scanSerialNumber',
      header: 'Scan Serial Number',
      minWidth: 150,
      sortable: true,
      sortValue: (row) => row.scanSerialNumber,
      render: (row) => row.scanSerialNumber,
    },
    {
      key: 'productName',
      header: 'Product Name',
      minWidth: 170,
      render: (row) => row.productName,
    },
    {
      key: 'chemistName',
      header: 'Chemist Name',
      minWidth: 170,
      render: (row) => {
        const chemist = getChemistByShopName(row.chemistName)
        return (
          <PartnerNameCell
            name={row.chemistName}
            onClick={
              chemist
                ? () => navigate(`/partners/chemists/${chemist.id}`)
                : undefined
            }
          />
        )
      },
    },
    {
      key: 'chemistScanDate',
      header: 'Chemist Scan Date',
      minWidth: 150,
      render: (row) => row.chemistScanDate,
    },
    {
      key: 'dealerName',
      header: 'Dealer Name',
      minWidth: 170,
      render: (row) => {
        const dealer = getDealerByShopName(row.dealerName)
        return (
          <PartnerNameCell
            name={row.dealerName}
            onClick={
              dealer ? () => navigate(`/partners/dealers/${dealer.id}`) : undefined
            }
          />
        )
      },
    },
    {
      key: 'dealerScanDate',
      header: 'Dealer Scan Date',
      minWidth: 150,
      render: (row) => row.dealerScanDate,
    },
  ]
}

export function FactoryUploadDetailsPage() {
  const navigate = useNavigate()
  const { batchId } = useParams<{ batchId: string }>()
  const { batch, isLoading } = useFactoryBatchDetail(batchId)
  const scanColumns = buildScanColumns(navigate)

  if (isLoading) {
    return <DetailsPageSkeleton sections={2} />
  }

  if (!batch) {
    return (
      <EmptyState
        title="Batch not found"
        description="This factory upload batch may have been removed."
        actionLabel="Back to Factory Inventory Upload"
        onAction={() => navigate('/inventory/factory-inventory-upload')}
      />
    )
  }

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
            <Typography variant="h1">{batch.batchNumber}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {batch.batchDate}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined size={20} />}
            onClick={() => {}}
            sx={{ fontSize: '0.75rem' }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={
              batch.isBmrSourced
                ? [
                    { label: 'Product Code', value: batch.productCode },
                    { label: 'Batch No.', value: batch.batchNumber },
                    {
                      label: 'Production Plan No.',
                      value: batch.productionPlanNumber,
                    },
                    { label: 'Batch Issued Date', value: batch.batchDate },
                    { label: 'Batch Issued By', value: batch.issuedBy },
                    { label: 'Month', value: batch.month },
                    { label: 'Qty', value: batch.quantity },
                    {
                      label: 'Sample Qty',
                      value: batch.retentionSampleQuantity,
                    },
                    { label: 'Plug Type', value: batch.plugType },
                    { label: 'Domestic', value: batch.domestic ?? '—' },
                    { label: 'Export', value: batch.export ?? '—' },
                    { label: 'Assy Line No.', value: batch.assemblyLine },
                    {
                      label: 'Batch Completed Date',
                      value: batch.batchCompletionDate,
                    },
                    { label: 'Produced Qty', value: batch.totalProducts },
                    {
                      label: 'Start Serial Number',
                      value: batch.startSerialNumber,
                    },
                    {
                      label: 'End Serial Number',
                      value: batch.endSerialNumber,
                    },
                  ]
                : [
                    { label: 'Upload ID', value: batch.uploadId },
                    {
                      label: 'Production Plan Number',
                      value: batch.productionPlanNumber,
                    },
                    { label: 'Batch Number', value: batch.batchNumber },
                    { label: 'Product Name', value: batch.productName },
                    { label: 'Product Code', value: batch.productCode },
                    { label: 'Batch Date', value: batch.batchDate },
                    {
                      label: 'Batch Completion Date',
                      value: batch.batchCompletionDate,
                    },
                    { label: 'Assembly Line', value: batch.assemblyLine },
                    { label: 'Export Type', value: batch.exportType },
                    { label: 'Plug Type', value: batch.plugType },
                    { label: 'Issued By', value: batch.issuedBy },
                    { label: 'Month', value: batch.month },
                    { label: 'Total Containers', value: batch.totalContainers },
                    {
                      label: 'Retention Sample Quantity',
                      value: batch.retentionSampleQuantity,
                    },
                    { label: 'Remarks', value: batch.remarks },
                  ]
            }
          />
        </SectionCard>

        <SectionCard title="Scan History">
          <CommonTable
            tableKey="factory-batch-scan-history"
            columns={scanColumns}
            rows={batch.scanHistory}
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search scan history…"
            searchKeys={(row) =>
              `${row.scanSerialNumber} ${row.productName} ${row.chemistName} ${row.dealerName}`
            }
            emptyTitle="No scans recorded yet"
            emptyDescription="Scan activity for this batch will appear here once products are scanned."
          />
        </SectionCard>
      </Stack>
    </>
  )
}
