import { useState } from 'react'
import { Alert, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { CircleCheck, FileSpreadsheet, ListChecks, Truck } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { generateMockDistributorRows } from '@/features/inventoryManagement/mockDistributorUpload'
import type { DistributorUploadRow, DistributorUploadSummary } from '@/types/distributorUpload'

const columns: CommonTableColumn<DistributorUploadRow>[] = [
  { key: 'distributorCode', header: 'Distributor Code', sortable: true, render: (row) => row.distributorCode },
  { key: 'distributorName', header: 'Distributor Name', minWidth: 200, sortable: true, render: (row) => row.distributorName },
  { key: 'contactPerson', header: 'Contact Person', render: (row) => row.contactPerson },
  { key: 'phone', header: 'Phone', render: (row) => row.phone },
  { key: 'city', header: 'City', sortable: true, render: (row) => row.city },
  { key: 'region', header: 'Region', sortable: true, render: (row) => row.region },
  { key: 'gstNumber', header: 'GST Number', render: (row) => row.gstNumber },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Chip label={row.isValid ? 'Valid' : row.validationNote} size="small" color={row.isValid ? 'success' : 'error'} variant="filled" />
    ),
  },
]

export function DistributorUploadTab() {
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<DistributorUploadRow[]>([])
  const [summary, setSummary] = useState<DistributorUploadSummary | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imported, setImported] = useState(false)

  async function handleUpload() {
    if (!file) return
    setIsProcessing(true)
    const { rows, summary } = generateMockDistributorRows(file.name)
    await new Promise((r) => setTimeout(r, 500))
    setRows(rows)
    setSummary(summary)
    setIsProcessing(false)
  }

  async function handleConfirmImport() {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsProcessing(false)
    setImported(true)
  }

  function resetUpload() {
    setFile(null)
    setRows([])
    setSummary(null)
    setImported(false)
  }

  if (imported && summary) {
    return (
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
          }}
        >
          <CircleCheck size={34} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>Distributor Data Imported Successfully</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 480 }}>
          {summary.validRows} distributor record(s) have been imported and are now available in the system.
        </Typography>
        <Button variant="contained" onClick={resetUpload}>
          Upload Another File
        </Button>
      </Stack>
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
          <Typography variant="h1">Upload Distributor Data</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Upload distributor master data (.xlsx / .xls) to add or update distributor records.
          </Typography>
        </Box>
      </Stack>

      <SectionCard title="Distributor Upload File">
        <FileDropzone file={file} onSelect={setFile} onRemove={resetUpload} accept=".xls,.xlsx" />
      </SectionCard>

      {!summary && (
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" disabled={!file} loading={isProcessing} onClick={handleUpload}>
            Upload & Preview
          </Button>
        </Stack>
      )}

      {summary && (
        <>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard label="Total Rows" value={summary.totalRows} icon={<FileSpreadsheet size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard label="Valid Rows" value={summary.validRows} icon={<CircleCheck size={20} />} iconColor="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard label="Duplicate Codes" value={summary.duplicateCodes} icon={<ListChecks size={20} />} iconColor="warning" />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard label="Invalid GST" value={summary.invalidGst} icon={<ListChecks size={20} />} iconColor="error" />
            </Grid>
          </Grid>

          {summary.duplicateCodes + summary.invalidGst > 0 && (
            <Alert severity="warning">
              {summary.duplicateCodes} duplicate distributor code(s) and {summary.invalidGst} row(s) with invalid GST were found.
              Only valid rows will be imported.
            </Alert>
          )}

          <SectionCard title="Uploaded Distributor Data">
            <CommonTable
              tableKey="distributor-upload-preview"
              columns={columns}
              rows={rows}
              getRowId={(row) => row.id}
              searchPlaceholder="Search distributors…"
              searchKeys={(row) => `${row.distributorName} ${row.distributorCode} ${row.city}`}
              emptyTitle="No distributor rows"
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
