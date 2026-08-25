import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Stack, Typography } from '@mui/material'
import { ScanLine as ScanIcon } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { ScanResultChip } from '@/features/fieldOperations/components/ScanResultChip'
import { useGetScanEventsByBatchQuery } from '@/features/fieldOperations/services/scanFeedApi'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFactoryProductionUploadDetail } from '@/features/inventoryManagement/hooks/useFactoryProductionUploadDetail'
import type { ScanEvent } from '@/types/scanFeed'

type ScanTab = 'all' | 'dealer' | 'chemist'

const SCAN_TABS: { label: string; value: ScanTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Dealer', value: 'dealer' },
  { label: 'Chemist', value: 'chemist' },
]

export function FactoryProductionUploadScansPage() {
  const navigate = useNavigate()
  const { uploadId } = useParams<{ uploadId: string }>()
  const [tab, setTab] = useState<ScanTab>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isFetching } = useGetScanEventsByBatchQuery(
    {
      uploadBatchId: uploadId ?? '',
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      partnerType: tab === 'all' ? undefined : tab.toUpperCase(),
    },
    { skip: !uploadId },
  )

  const scans = data?.items ?? []
  // Also fetch an overall total (no partnerType filter) so the UI can show
  // the combined scan count across Dealers + Chemists even when a tab is
  // selected. Use a small page/limit to keep payload minimal.
  const { data: overallData } = useGetScanEventsByBatchQuery({
    uploadBatchId: uploadId ?? '',
    page: 1,
    limit: 1,
    search: debouncedSearch || undefined,
  })

  console.log('overallData', overallData)

  const totalItems = overallData?.totalItems ?? data?.totalItems ?? 0

  const { batch: uploadBatch } = useFactoryProductionUploadDetail(uploadId)

  const openScan = (scanId: string) =>
    navigate(`/field-operations/live-scan-feed/${scanId}`)

  if (!uploadId) {
    return (
      <EmptyState
        title="Upload not found"
        description="This upload batch may have been removed."
        actionLabel="Back to Uploaded Inventory"
        onAction={() => navigate('/inventory/factory-inventory-upload/uploads')}
      />
    )
  }

  const columns: CommonTableColumn<ScanEvent>[] = [
    {
      key: 'businessName',
      header: 'Business Name',
      minWidth: 220,
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openScan(row.id)}
        >
          {row.businessDetails.businessName}
        </Typography>
      ),
    },
    { key: 'partnerType', header: 'Type', render: (row) => row.partnerType },
    {
      key: 'partnerName',
      header: 'Name',
      minWidth: 160,
      render: (row) => row.businessDetails.partnerName,
    },
    {
      key: 'scannedAt',
      header: 'Scan Date & Time',
      minWidth: 170,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem' }}>
          {new Date(row.scannedAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </Typography>
      ),
    },
    {
      key: 'scanResult',
      header: 'Scan Result',
      render: (row) => (
        <ScanResultChip status={row.scanStatus} label={row.scanResult} />
      ),
    },
    {
      key: 'scannedCode',
      header: 'Scan Code',
      minWidth: 220,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openScan(row.id)}
        >
          {row.scannedCode}
        </Typography>
      ),
    },
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 150,
      render: (row) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
          {row.productDetails.productCode}
        </Typography>
      ),
    },
    {
      key: 'batchNo',
      header: 'Batch No.',
      minWidth: 140,
      render: (row) => row.batchNo,
    },
    { key: 'region', header: 'Region', render: (row) => row.region },
    {
      key: 'rewardPointsEarned',
      header: 'Reward Pts',
      align: 'center',
      render: (row) => row.rewardPointsEarned?.toLocaleString('en-IN') ?? '0',
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
            <ScanIcon size={20} />
          </Box>
          <Box>
            <Typography variant="h1">Batch Scan History</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Scan activity recorded against this upload batch across Dealers
              and Chemists.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              {
                label: 'File Name',
                value:
                  overallData?.uploadBatchFileName ||
                  uploadBatch?.uploadFileName ||
                  uploadId ||
                  'N/A',
              },
              {
                label: 'Total Scans',
                value: totalItems.toLocaleString('en-IN'),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Scan Products">
          <Box sx={{ mb: 2 }}>
            <ModularTabs<ScanTab>
              tabs={SCAN_TABS}
              value={tab}
              onChange={(next) => {
                setTab(next)
                setPage(0)
              }}
              variant="filled"
            />
          </Box>

          <CommonTable
            key={tab}
            tableKey="factory-upload-batch-scans"
            columns={columns}
            rows={scans}
            loading={isFetching}
            getRowId={(row) => row.id}
            onRowClick={(row) => openScan(row.id)}
            searchPlaceholder="Search scans…"
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(0)
            }}
            totalCount={totalItems}
            page={page}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(next) => {
              setRowsPerPage(next)
              setPage(0)
            }}
            rowsPerPageOptions={[10, 20, 50]}
            emptyTitle="No scans found"
            emptyDescription="No scan activity recorded for this batch yet."
          />
        </SectionCard>
      </Stack>
    </>
  )
}
