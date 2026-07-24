import { useState } from 'react'
import { Alert, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { CircleCheck, FileSpreadsheet, ListChecks, Truck } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { Toast } from '@/components/common/Toast/Toast'
import { parseDispatchReportFile, type DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type { DispatchUploadRow, DispatchUploadSummary } from '@/types/distributorUpload'

const columns: CommonTableColumn<DispatchUploadRow>[] = [
  { key: 'srNo', header: 'Sr. No.', align: 'center', sortable: true, render: (row) => row.srNo },
  { key: 'itemCode', header: 'Item Code', sortable: true, render: (row) => row.itemCode },
  { key: 'itemName', header: 'Item Name', minWidth: 220, render: (row) => row.itemName },
  { key: 'cartonNo', header: 'Carton No.', align: 'center', render: (row) => row.cartonNo },
  { key: 'cartonWeight', header: 'Carton Weight', align: 'center', render: (row) => row.cartonWeight.toFixed(2) },
  { key: 'dispatchQty', header: 'Dispatch Qty', align: 'center', render: (row) => row.dispatchQty },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Chip label={row.isValid ? 'Valid' : row.validationNote} size="small" color={row.isValid ? 'success' : 'error'} variant="filled" />
    ),
  },
]

interface DistributorUploadTabProps {
  onImported?: (rows: DispatchUploadRow[], uploadFileName: string, invoiceMeta: DispatchInvoiceMeta) => void
  /** Called automatically a couple seconds after a successful import, to leave the wizard. */
  onDone?: () => void
}

export function DistributorUploadTab({ onImported, onDone }: DistributorUploadTabProps = {}) {
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState<DispatchInvoiceMeta | null>(null)
  const [rows, setRows] = useState<DispatchUploadRow[]>([])
  const [summary, setSummary] = useState<DispatchUploadSummary | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imported, setImported] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null)

  async function handleUpload() {
    if (!file) return
    setIsProcessing(true)
    setParseError(null)
    try {
      const parsed = await parseDispatchReportFile(file)
      setMeta(parsed.meta)
      setRows(parsed.rows)
      setSummary(parsed.summary)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not parse the file.')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleConfirmImport() {
    if (!meta || !summary) return
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsProcessing(false)
    setImported(true)
    onImported?.(rows, file?.name ?? 'dispatch-loading-report.xlsx', meta)
    setToast({
      title: 'Import successful',
      message: `${summary.validRows} carton line item(s) imported under invoice ${meta.invoiceNo}.`,
    })
    if (onDone) {
      setTimeout(onDone, 2000)
    }
  }

  function resetUpload() {
    setFile(null)
    setMeta(null)
    setRows([])
    setSummary(null)
    setImported(false)
    setParseError(null)
  }

  if (imported && summary && meta) {
    return (
      <>
        <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'success.light',
              color: 'success.main',
              animation: 'distributor-import-success-pop 0.5s ease-out, distributor-import-success-ring 1.2s ease-out',
              '@keyframes distributor-import-success-pop': {
                '0%': { transform: 'scale(0)' },
                '60%': { transform: 'scale(1.15)' },
                '100%': { transform: 'scale(1)' },
              },
              '@keyframes distributor-import-success-ring': {
                '0%': { boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.4)' },
                '100%': { boxShadow: '0 0 0 18px rgba(46, 125, 50, 0)' },
              },
            }}
          >
            <CircleCheck size={34} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Dispatch Data Imported Successfully</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480 }}>
            {summary.validRows} carton line item(s) have been imported under invoice {meta.invoiceNo} and are now available in Distributor Upload.
          </Typography>
        </Stack>
        <Toast
          open={!!toast}
          title={toast?.title}
          message={toast?.message ?? ''}
          severity="success"
          onClose={() => setToast(null)}
        />
      </>
    )
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
            Upload the Dispatch Loading Report (.xlsx / .xls) exactly as exported — customer,
            transporter, invoice details, and carton line items are all read directly from the file.
          </Typography>
        </Box>
      </Stack>

      <SectionCard title="Dispatch Loading Report File">
        <FileDropzone file={file} onSelect={setFile} onRemove={resetUpload} accept=".xls,.xlsx" />
      </SectionCard>

      {parseError && <Alert severity="error">{parseError}</Alert>}

      {!summary && (
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" disabled={!file} loading={isProcessing} onClick={handleUpload}>
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
              <StatCard label="Total Rows" value={summary.totalRows} icon={<FileSpreadsheet size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard label="Valid Rows" value={summary.validRows} icon={<CircleCheck size={20} />} iconColor="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard label="Duplicate Cartons" value={summary.duplicateCartons} icon={<ListChecks size={20} />} iconColor="warning" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard label="Invalid Weights" value={summary.invalidWeights} icon={<ListChecks size={20} />} iconColor="error" />
            </Grid>
          </Grid>

          {summary.duplicateCartons + summary.invalidWeights > 0 && (
            <Alert severity="warning">
              {summary.duplicateCartons} duplicate carton number(s) and {summary.invalidWeights} row(s) with an invalid carton weight were found.
              Only valid rows will be imported.
            </Alert>
          )}

          <SectionCard title="Uploaded Carton Data">
            <CommonTable
              tableKey="dispatch-upload-preview"
              columns={columns}
              rows={rows}
              getRowId={(row) => row.id}
              searchPlaceholder="Search carton rows…"
              searchKeys={(row) => `${row.itemCode} ${row.itemName} ${row.cartonNo}`}
              defaultSortBy="srNo"
              emptyTitle="No carton rows"
            />
          </SectionCard>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={resetUpload}>
              Cancel
            </Button>
            <Button variant="contained" loading={isProcessing} onClick={handleConfirmImport}>
              Confirm Import
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  )
}
