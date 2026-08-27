import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useEffect } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { Factory as FactoryOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { SerialRangeDialog } from '@/components/common/SerialRangeDialog'
import { useFactoryProductionUploadDetail } from '@/features/inventoryManagement/hooks/useFactoryProductionUploadDetail'
import { formatDate } from '@/utils/formatDate'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type {
  FactoryProductionUploadRowRecord,
  FactoryProductionUploadBatchSummary,
} from '@/types/factoryProductionUpload'
import { useDeleteFactoryProductionUploadBatchMutation } from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { useGetFactoryProductionUploadRowsQuery } from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { skipToken } from '@reduxjs/toolkit/query/react'

export function FactoryProductionUploadDetailsPage() {
  const navigate = useNavigate()
  const { uploadId } = useParams<{ uploadId: string }>()
  const { batch, isLoading, error } = useFactoryProductionUploadDetail(uploadId)
  const toast = useToast()
  const [batchToDelete, setBatchToDelete] =
    useState<FactoryProductionUploadBatchSummary | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [serialRangeTarget, setSerialRangeTarget] = useState<{
    batchNo: string
    startSerialNumber: string | number
    endSerialNumber: string | number
  } | null>(null)
  const [deleteBatch, { isLoading: isDeleting }] =
    useDeleteFactoryProductionUploadBatchMutation()

  const rowColumns: CommonTableColumn<FactoryProductionUploadRowRecord>[] = [
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 130,
      render: (row) => row.productCode,
    },
    {
      key: 'batchNo',
      header: 'Batch No.',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.batchNo,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={(event) => {
            event.stopPropagation()
            setSerialRangeTarget({
              batchNo: row.batchNo,
              startSerialNumber: row.startSerialNumber,
              endSerialNumber: row.endSerialNumber,
            })
          }}
        >
          {row.batchNo}
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
      key: 'batchIssuedDate',
      header: 'Batch Issued Date',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.batchIssuedDate,
      render: (row) => formatDate(row.batchIssuedDate),
    },
    {
      key: 'batchIssuedByName',
      header: 'Batch Issued By',
      minWidth: 130,
      render: (row) => row.batchIssuedByName,
    },
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
    {
      key: 'plugType',
      header: 'Plug Type',
      minWidth: 100,
      render: (row) => row.plugType,
    },
    {
      key: 'domestic',
      header: 'Domestic',
      minWidth: 90,
      render: (row) => row.domestic,
    },
    {
      key: 'export',
      header: 'Export',
      minWidth: 90,
      render: (row) => row.export,
    },
    {
      key: 'assyLineNo',
      header: 'Assy Line No.',
      minWidth: 110,
      render: (row) => row.assyLineNo || '-',
    },
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

  const debouncedSearch = useDebouncedValue(search, 200)
  const isSearching = debouncedSearch.trim().length > 0

  // Server-side search scoped to this upload batch. When there's no query we
  // fall back to the rows embedded in the batch detail (fetched already).
  const { data: searchRowsData, isFetching: isFetchingSearch } =
    useGetFactoryProductionUploadRowsQuery(
      isSearching && uploadId
        ? {
            uploadBatchId: uploadId,
            search: debouncedSearch,
            page: page + 1,
            limit: rowsPerPage,
          }
        : skipToken,
    )

  useEffect(() => {
    console.log(
      'debouncedSearch ->',
      debouncedSearch,
      'isSearching ->',
      isSearching,
    )
  }, [debouncedSearch, isSearching])

  useEffect(() => {
    console.log('searchRowsData ->', searchRowsData)
  }, [searchRowsData])

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

  const clientRows = batch.rows ?? []
  const rows = isSearching ? (searchRowsData?.items ?? []) : clientRows

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
            <Typography variant="h1">Inventory Excel Upload</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Uploaded {formatDate(batch.createdAt)}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => batch && setBatchToDelete(batch)}
            disabled={!batch}
          >
            Delete
          </Button>
        </Box>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Upload ID', value: batch.fileName },
              {
                label: 'Total Products',
                value: batch.totalRows.toLocaleString('en-IN'),
              },
              { label: 'Uploaded At', value: formatDate(batch.createdAt) },
            ]}
          />
        </SectionCard>

        <SerialRangeDialog
          open={Boolean(serialRangeTarget)}
          onClose={() => setSerialRangeTarget(null)}
          prefix={serialRangeTarget?.batchNo ?? ''}
          startSerial={serialRangeTarget?.startSerialNumber ?? ''}
          endSerial={serialRangeTarget?.endSerialNumber ?? ''}
          title="Combined Batch Serial Range"
        />

        <SectionCard title="Batch Rows">
          <CommonTable
            tableKey="factory-production-upload-rows"
            columns={rowColumns}
            rows={rows}
            loading={isSearching && isFetchingSearch}
            searchValue={search}
            onSearchChange={(v) => {
              console.log('CommonTable onSearchChange ->', v)
              setSearch(v)
              setPage(0)
            }}
            totalCount={
              isSearching ? (searchRowsData?.totalItems ?? 0) : undefined
            }
            page={isSearching ? page : undefined}
            onPageChange={isSearching ? setPage : undefined}
            rowsPerPage={isSearching ? rowsPerPage : undefined}
            onRowsPerPageChange={
              isSearching
                ? (n) => {
                    setRowsPerPage(n)
                    setPage(0)
                  }
                : undefined
            }
            getRowId={(row) => row.id}
            searchPlaceholder="Search by product code or batch number…"
            emptyTitle="No rows in this upload"
            emptyDescription="This upload batch does not contain any rows."
          />
        </SectionCard>
      </Stack>

      <Dialog
        open={!!batchToDelete}
        onClose={() => setBatchToDelete(null)}
        aria-labelledby="delete-upload-dialog-title"
      >
        <DialogTitle id="delete-upload-dialog-title">Delete upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete upload{' '}
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {batchToDelete?.fileName}
            </Typography>
            ? This will remove every row imported by this upload and cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchToDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!batchToDelete) return
              try {
                await deleteBatch(batchToDelete.id).unwrap()
                toast.success('Upload deleted', 'Deleted')
                setBatchToDelete(null)
                navigate('/inventory/factory-inventory-upload')
              } catch (e) {
                const msg = getApiErrorMessage(e, 'Failed to delete upload.')
                toast.error(msg)
              }
            }}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
