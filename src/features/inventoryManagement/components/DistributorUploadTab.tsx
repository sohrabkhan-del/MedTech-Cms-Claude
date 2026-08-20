import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import {
  CircleAlert,
  CircleCheck,
  FileSpreadsheet,
  ListChecks,
  Truck,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { StatCard } from '@/components/common/StatCard/StatCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import {
  parseDispatchReportFile,
  type DispatchInvoiceMeta,
} from '@/features/inventoryManagement/dispatchReportParser'
import { usePreviewImportMutation } from '@/features/inventoryManagement/services/distributorUploadApi'
import type {
  DispatchUploadPreview,
  DispatchUploadRow,
} from '@/types/distributorUpload'

const columns: CommonTableColumn<DispatchUploadRow>[] = [
  {
    key: 'srNo',
    header: 'Sr. No.',
    align: 'center',
    sortable: true,
    render: (row) => row.srNo,
  },
  {
    key: 'itemCode',
    header: 'Item Code',
    sortable: true,
    render: (row) => row.itemCode,
  },
  {
    key: 'itemName',
    header: 'Item Name',
    minWidth: 220,
    render: (row) => row.itemName,
  },
  {
    key: 'cartonNo',
    header: 'Carton No.',
    align: 'center',
    render: (row) => row.cartonNo,
  },
  {
    key: 'cartonWeight',
    header: 'Carton Weight',
    align: 'center',
    render: (row) => row.cartonWeight.toFixed(2),
  },
  {
    key: 'dispatchQty',
    header: 'Dispatch Qty',
    align: 'center',
    render: (row) => row.dispatchQty,
  },
  {
    key: 'status',
    header: 'Decision',
    sortValue: (row) => row.previewStatus ?? (row.isValid ? 'add' : 'invalid'),
    render: (row) => {
      const status = row.previewStatus ?? (row.isValid ? 'add' : 'invalid')
      const label =
        status === 'add'
          ? 'Will Add'
          : status === 'duplicate'
            ? 'Duplicate'
            : status === 'skip'
              ? 'Will Not Add'
              : 'Invalid'
      const color =
        status === 'add'
          ? 'success'
          : status === 'duplicate'
            ? 'warning'
            : 'error'
      return <Chip label={label} size="small" color={color} variant="filled" />
    },
  },
  {
    key: 'validationNote',
    header: 'Reason',
    minWidth: 220,
    render: (row) => row.validationNote || '—',
  },
]

interface DistributorUploadTabProps {
  onImported?: (
    rows: DispatchUploadRow[],
    uploadFileName: string,
    invoiceMeta: DispatchInvoiceMeta,
  ) => void
  /** Called immediately after a successful import, to leave the wizard. */
  onDone?: () => void
}

export function DistributorUploadTab({
  onImported,
  onDone,
}: DistributorUploadTabProps = {}) {
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState<DispatchInvoiceMeta | null>(null)
  const [rows, setRows] = useState<DispatchUploadRow[]>([])
  const [summary, setSummary] = useState<
    DispatchUploadPreview['summary'] | null
  >(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [previewImport, { isLoading: isPreviewing }] =
    usePreviewImportMutation()
  const rejectedRows = summary ? summary.totalRows - summary.validRows : 0
  const validRows = useMemo(() => rows.filter((row) => row.isValid), [rows])
  const rejectedPreviewRows = useMemo(
    () => rows.filter((row) => !row.isValid),
    [rows],
  )

  async function handleUpload() {
    if (!file) return
    setIsProcessing(true)
    setParseError(null)
    try {
      const parsed = await parseDispatchReportFile(file)
      const preview = await previewImport({
        rows: parsed.rows,
        uploadFileName: file.name,
        invoiceMeta: parsed.meta,
      }).unwrap()
      setMeta(parsed.meta)
      setRows(preview.rows)
      setSummary(preview.summary)
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : 'Could not parse the file.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleConfirmImport() {
    if (!meta || !summary) return
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsProcessing(false)
    onImported?.(rows, file?.name ?? 'dispatch-loading-report.xlsx', meta)
    onDone?.()
  }

  function resetUpload() {
    setFile(null)
    setMeta(null)
    setRows([])
    setSummary(null)
    setParseError(null)
  }

  return (
    <Stack spacing={3}>
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
          <Truck size={20} />
        </Box>
        <Box>
          <Typography variant="h1">Upload Dispatch Loading Report</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Upload the Dispatch Loading Report (.xlsx / .xls) exactly as
            exported — customer, transporter, invoice details, and carton line
            items are all read directly from the file.
          </Typography>
        </Box>
      </Stack>

      <SectionCard title="Dispatch Loading Report File">
        <FileDropzone
          file={file}
          onSelect={setFile}
          onRemove={resetUpload}
          accept=".xls,.xlsx"
        />
      </SectionCard>

      {parseError && <Alert severity="error">{parseError}</Alert>}

      {!summary && (
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            disabled={!file}
            loading={isProcessing || isPreviewing}
            onClick={handleUpload}
          >
            Upload & Preview
          </Button>
        </Stack>
      )}

      {summary && meta && (
        <>
          <SectionCard title="Invoice Details (read from file)">
            <DetailFieldGrid
              fields={[
                { label: 'Customer Name', value: meta.customerName },
                { label: 'Invoice No.', value: meta.invoiceNo },
                { label: 'Transporter', value: meta.transporter || '—' },
                { label: 'Total Box Qty', value: meta.totalBoxQty },
                { label: 'Vehicle No.', value: meta.vehicleNo || '—' },
                { label: 'Date', value: meta.date || '—' },
              ]}
            />
          </SectionCard>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Total Rows"
                value={summary.totalRows}
                icon={<FileSpreadsheet size={20} />}
                iconColor="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Will Add"
                value={summary.validRows}
                icon={<CircleCheck size={20} />}
                iconColor="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Duplicate Cartons"
                value={summary.duplicateCartons}
                icon={<ListChecks size={20} />}
                iconColor="warning"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Will Not Add"
                value={summary.totalRows - summary.validRows}
                icon={<ListChecks size={20} />}
                iconColor="error"
              />
            </Grid>
          </Grid>

          {rejectedRows > 0 && (
            <Alert
              severity={summary.validRows > 0 ? 'warning' : 'error'}
              icon={<CircleAlert size={20} />}
            >
              {summary.duplicateCartons > 0
                ? `${summary.duplicateCartons} duplicate row(s) found`
                : `${rejectedRows} row(s) will not be added`}
              {summary.existingDuplicateInvoices
                ? ` against ${summary.existingDuplicateInvoices} existing invoice upload(s)`
                : ''}
              . Only rows marked Will Add will be imported.
            </Alert>
          )}

          <SectionCard title="Rows Will Be Added">
            <CommonTable
              tableKey="dispatch-upload-valid-preview"
              columns={columns}
              rows={validRows}
              getRowId={(row) => row.id}
              searchPlaceholder="Search valid carton rows…"
              searchKeys={(row) =>
                `${row.itemCode} ${row.itemName} ${row.cartonNo}`
              }
              defaultSortBy="srNo"
              emptyTitle="No valid carton rows"
              emptyDescription="Every row in this preview is duplicate, invalid, or skipped."
            />
          </SectionCard>

          {rejectedPreviewRows.length > 0 && (
            <SectionCard title="Duplicate / Invalid Rows">
              <CommonTable
                tableKey="dispatch-upload-rejected-preview"
                columns={columns}
                rows={rejectedPreviewRows}
                getRowId={(row) => row.id}
                searchPlaceholder="Search duplicate or invalid rows…"
                searchKeys={(row) =>
                  `${row.itemCode} ${row.itemName} ${row.cartonNo} ${row.validationNote ?? ''}`
                }
                defaultSortBy="srNo"
                emptyTitle="No duplicate or invalid rows"
                getRowSx={(row) => ({
                  bgcolor:
                    row.previewStatus === 'duplicate'
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'rgba(239, 68, 68, 0.08)',
                  '&:hover': {
                    bgcolor:
                      row.previewStatus === 'duplicate'
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
            <Button variant="outlined" onClick={resetUpload}>
              Cancel
            </Button>
            <Button
              variant="contained"
              loading={isProcessing}
              disabled={summary.validRows === 0}
              onClick={handleConfirmImport}
            >
              Confirm Import
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  )
}
