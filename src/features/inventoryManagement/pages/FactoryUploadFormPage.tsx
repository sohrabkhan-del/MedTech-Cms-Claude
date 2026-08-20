import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import {
  CircleCheck,
  Download as DownloadOutlined,
  Factory as FactoryOutlined,
  FileSpreadsheet,
  ListChecks,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { StatCard } from '@/components/common/StatCard/StatCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { radius } from '@/theme/tokens'
import { useFactoryProductionUpload } from '@/features/inventoryManagement/hooks/useFactoryProductionUpload'
import { downloadFactoryProductionUploadTemplate } from '@/features/inventoryManagement/factoryProductionUploadParser'
import type {
  FactoryProductionPreviewRow,
  FactoryProductionUploadBatch,
  FactoryProductionUploadPreview,
} from '@/types/factoryProductionUpload'

const previewColumns: CommonTableColumn<FactoryProductionPreviewRow>[] = [
  {
    key: 'rowNo',
    header: 'Row',
    align: 'center',
    sortable: true,
    render: (row) => row.rowNo,
  },
  {
    key: 'productCode',
    header: 'Product Code',
    sortable: true,
    render: (row) => row.productCode,
  },
  {
    key: 'batchNo',
    header: 'Batch No.',
    minWidth: 180,
    sortable: true,
    render: (row) => row.batchNo,
  },
  {
    key: 'qty',
    header: 'Qty',
    align: 'center',
    render: (row) => row.qty.toLocaleString('en-IN'),
  },
  {
    key: 'producedQty',
    header: 'Produced Qty',
    align: 'center',
    render: (row) => row.producedQty.toLocaleString('en-IN'),
  },
  {
    key: 'action',
    header: 'Decision',
    render: (row) => {
      const color =
        row.action === 'add'
          ? 'success'
          : row.action === 'duplicate'
            ? 'warning'
            : 'error'
      const label =
        row.action === 'add'
          ? 'Will Add'
          : row.action === 'duplicate'
            ? 'Duplicate'
            : row.action === 'skip'
              ? 'Will Not Add'
              : 'Invalid'
      return <Chip label={label} size="small" color={color} variant="filled" />
    },
  },
  {
    key: 'reason',
    header: 'Reason',
    minWidth: 220,
    render: (row) => row.reason || '—',
  },
]

export function FactoryUploadFormPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<FactoryProductionUploadPreview | null>(
    null,
  )
  const [uploadedBatch, setUploadedBatch] =
    useState<FactoryProductionUploadBatch | null>(null)
  const { previewFile, uploadRowsFromPreview, isPreviewing, isUploading } =
    useFactoryProductionUpload()
  const addablePreviewRows = useMemo(
    () => preview?.rows.filter((row) => row.isValid) ?? [],
    [preview],
  )
  const rejectedPreviewRows = useMemo(
    () => preview?.rows.filter((row) => !row.isValid) ?? [],
    [preview],
  )

  const handleContinue = async () => {
    if (!file) return
    const result = await previewFile(file)
    if (result) setPreview(result)
  }

  const handleConfirmImport = async () => {
    if (!preview) return
    const rowsToAdd = preview.rows.filter((row) => row.isValid)
    const batch = await uploadRowsFromPreview(rowsToAdd)
    if (batch) setUploadedBatch(batch)
  }

  const handleViewBatch = () => {
    if (uploadedBatch)
      navigate(`/inventory/factory-inventory-upload/upload/${uploadedBatch.id}`)
  }

  const handleUploadAnother = () => {
    setUploadedBatch(null)
    setPreview(null)
    setFile(null)
  }

  const resetFile = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', mb: 2.5 }}
      >
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
          <Typography variant="h1">Upload Manifest</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Import a new production batch from a single Excel manifest file.
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Manifest File">
          <FileDropzone
            file={file}
            onSelect={setFile}
            onRemove={resetFile}
            accept=".xls,.xlsx"
          />
        </SectionCard>

        {!preview && (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button
              variant="outlined"
              startIcon={<DownloadOutlined size={20} />}
              onClick={downloadFactoryProductionUploadTemplate}
            >
              Download Upload Template
            </Button>
            <Button
              variant="contained"
              disabled={!file}
              loading={isPreviewing}
              onClick={handleContinue}
            >
              Validate & Preview
            </Button>
          </Stack>
        )}

        {preview && (
          <>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatCard
                  label="Total Rows"
                  value={preview.totalRows}
                  icon={<FileSpreadsheet size={20} />}
                  iconColor="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatCard
                  label="Will Add"
                  value={preview.addableRows}
                  icon={<CircleCheck size={20} />}
                  iconColor="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatCard
                  label="Duplicates"
                  value={preview.duplicateRows}
                  icon={<ListChecks size={20} />}
                  iconColor="warning"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatCard
                  label="Will Not Add"
                  value={preview.invalidRows + preview.skippedRows}
                  icon={<ListChecks size={20} />}
                  iconColor="error"
                />
              </Grid>
            </Grid>

            {preview.addableRows < preview.totalRows && (
              <Alert severity="warning">
                {preview.totalRows - preview.addableRows} row(s) will not be
                added. Only rows marked Will Add are imported.
              </Alert>
            )}

            <SectionCard title="Rows Will Be Added">
              <CommonTable
                tableKey="factory-upload-addable-preview"
                columns={previewColumns}
                rows={addablePreviewRows}
                getRowId={(row) => row.id}
                searchPlaceholder="Search product or batch..."
                searchKeys={(row) =>
                  `${row.productCode} ${row.batchNo} ${row.reason ?? ''}`
                }
                defaultSortBy="rowNo"
                emptyTitle="No rows will be added"
                emptyDescription="Every row in this preview is duplicate, invalid, or skipped."
              />
            </SectionCard>

            {rejectedPreviewRows.length > 0 && (
              <SectionCard title="Duplicate / Invalid Rows">
                <CommonTable
                  tableKey="factory-upload-rejected-preview"
                  columns={previewColumns}
                  rows={rejectedPreviewRows}
                  getRowId={(row) => row.id}
                  searchPlaceholder="Search product, batch, or reason..."
                  searchKeys={(row) =>
                    `${row.productCode} ${row.batchNo} ${row.reason ?? ''}`
                  }
                  defaultSortBy="rowNo"
                  emptyTitle="No duplicate or invalid rows"
                  getRowSx={(row) => ({
                    bgcolor:
                      row.action === 'duplicate'
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'rgba(239, 68, 68, 0.08)',
                    '&:hover': {
                      bgcolor:
                        row.action === 'duplicate'
                          ? 'rgba(245, 158, 11, 0.14)'
                          : 'rgba(239, 68, 68, 0.14)',
                    },
                  })}
                />
              </SectionCard>
            )}

            <Stack
              direction="row"
              spacing={1.5}
              sx={{ justifyContent: 'flex-end' }}
            >
              <Button variant="outlined" onClick={resetFile}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={preview.addableRows === 0}
                loading={isUploading}
                onClick={handleConfirmImport}
              >
                Confirm Import
              </Button>
            </Stack>
          </>
        )}

        <SectionCard title="Upload Instructions">
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            {[
              'Only .xls or .xlsx files are accepted.',
              'The first row must contain column headers matching the upload template.',
              'Each row corresponds to one production batch entry.',
              'If a product code does not exist in the Product Master, it is created automatically.',
              'Maximum file size: 25 MB per upload.',
            ].map((line) => (
              <Typography
                key={line}
                component="li"
                variant="body1"
                sx={{ color: 'text.secondary' }}
              >
                {line}
              </Typography>
            ))}
          </Stack>
        </SectionCard>
      </Stack>

      <Dialog
        open={!!uploadedBatch}
        onClose={handleUploadAnother}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: `${radius.xl}px` } },
        }}
      >
        <DialogContent sx={{ px: 3, pt: 4, pb: 3 }}>
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'success.light',
                color: 'success.main',
              }}
            >
              <CircleCheck size={30} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
              Manifest Uploaded Successfully
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {uploadedBatch && (
                <>
                  <strong>{uploadedBatch.uploadFileName}</strong> was imported
                  with {(uploadedBatch.totalRows ?? 0).toLocaleString('en-IN')}{' '}
                  row(s).
                </>
              )}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleUploadAnother}
              >
                Upload Another
              </Button>
              <Button variant="contained" fullWidth onClick={handleViewBatch}>
                View Batch
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
