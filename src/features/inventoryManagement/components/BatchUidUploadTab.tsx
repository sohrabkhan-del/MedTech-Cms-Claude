import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import {
  Boxes,
  CircleCheck,
  FileSpreadsheet,
  Layers,
  ListChecks,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { StatCard } from '@/components/common/StatCard/StatCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import {
  ExpandableTable,
  type ExpandableTableColumn,
} from '@/components/common/ExpandableTable/ExpandableTable'
import { Toast } from '@/components/common/Toast/Toast'
import {
  buildMappedBatches,
  generateUidsForBatch,
  parseBmrFile,
  parseMasterCartonFile,
} from '@/features/inventoryManagement/mockBatchUidUpload'
import type {
  BmrBatchRow,
  BmrValidationSummary,
  MappedBatch,
  MasterCartonLinkRow,
  MasterCartonUploadSummary,
} from '@/types/batchUidUpload'

const STEP_LABELS = [
  'Upload BMR',
  'Validate & Map Data',
  'Import Confirmation',
  'BMR Import Success',
  'Upload Carton Linkage',
  'Carton Linkage Success',
]

const batchColumns: CommonTableColumn<BmrBatchRow>[] = [
  {
    key: 'productCode',
    header: 'Product Code',
    minWidth: 130,
    render: (row) => row.productCode,
  },
  {
    key: 'batchNumber',
    header: 'Batch No.',
    minWidth: 140,
    render: (row) => row.batchNumber,
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
    render: (row) => row.batchIssuedDate,
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
    align: 'right',
    minWidth: 90,
    render: (row) => row.qty.toLocaleString('en-IN'),
  },
  {
    key: 'sampleQty',
    header: 'Sample Qty',
    align: 'right',
    minWidth: 100,
    render: (row) => row.sampleQty.toLocaleString('en-IN'),
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
    minWidth: 100,
    render: (row) => row.domestic,
  },
  {
    key: 'export',
    header: 'Export',
    minWidth: 100,
    render: (row) => row.export,
  },
  {
    key: 'assyLineNo',
    header: 'Assy Line No.',
    minWidth: 110,
    render: (row) => row.assyLineNo,
  },
  {
    key: 'batchCompletedDate',
    header: 'Batch Completed Date',
    minWidth: 150,
    render: (row) => row.batchCompletedDate,
  },
  {
    key: 'producedQty',
    header: 'Produced Qty',
    align: 'right',
    minWidth: 110,
    render: (row) => row.producedQty.toLocaleString('en-IN'),
  },
  {
    key: 'startSerialNumber',
    header: 'Start Serial',
    minWidth: 110,
    render: (row) => row.startSerialNumber,
  },
  {
    key: 'endSerialNumber',
    header: 'End Serial',
    minWidth: 110,
    render: (row) => row.endSerialNumber,
  },
  {
    key: 'status',
    header: 'Status',
    minWidth: 120,
    render: (row) => (
      <Chip
        label={row.isValid ? 'Valid' : row.validationNote}
        size="small"
        color={row.isValid ? 'success' : 'error'}
        variant="filled"
      />
    ),
  },
]

const mappedBatchColumns: ExpandableTableColumn<MappedBatch>[] = [
  {
    key: 'batchNumber',
    header: 'Batch Number',
    render: (row) => row.batchNumber,
  },
  {
    key: 'productCode',
    header: 'Product Code',
    render: (row) => row.productCode,
  },
  {
    key: 'producedQty',
    header: 'Produced Qty',
    align: 'right',
    render: (row) => row.producedQty.toLocaleString('en-IN'),
  },
  {
    key: 'uidCount',
    header: 'UIDs Generated',
    align: 'right',
    render: (row) => row.uidCount.toLocaleString('en-IN'),
  },
]

const cartonLinkColumns: CommonTableColumn<MasterCartonLinkRow>[] = [
  { key: 'uid', header: 'UID', minWidth: 220, render: (row) => row.uid },
  {
    key: 'masterCartonNumber',
    header: 'Master Carton Number',
    minWidth: 180,
    render: (row) => row.masterCartonNumber,
  },
  {
    key: 'status',
    header: 'Status',
    minWidth: 200,
    render: (row) => (
      <Chip
        label={row.isValid ? 'Valid' : row.validationNote}
        size="small"
        color={row.isValid ? 'success' : 'error'}
        variant="filled"
      />
    ),
  },
]

function StepHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
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
        {icon}
      </Box>
      <Box>
        <Typography variant="h1">{title}</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  )
}

interface BatchUidUploadTabProps {
  onImported?: (batchRows: BmrBatchRow[], mappedBatches: MappedBatch[], uploadFileName: string) => void
}

export function BatchUidUploadTab({ onImported }: BatchUidUploadTabProps = {}) {
  const [activeStep, setActiveStep] = useState(0)
  const [bmrFile, setBmrFile] = useState<File | null>(null)
  const [batchRows, setBatchRows] = useState<BmrBatchRow[]>([])
  const [summary, setSummary] = useState<BmrValidationSummary | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    severity: 'success' | 'warning'
    title: string
    message: string
  } | null>(null)

  const [cartonFile, setCartonFile] = useState<File | null>(null)
  const [cartonRows, setCartonRows] = useState<MasterCartonLinkRow[]>([])
  const [cartonSummary, setCartonSummary] =
    useState<MasterCartonUploadSummary | null>(null)
  const [cartonParseError, setCartonParseError] = useState<string | null>(null)

  const mappedBatches = buildMappedBatches(batchRows)
  const knownUids = new Set(
    batchRows
      .filter((row) => row.isValid)
      .flatMap((row) => generateUidsForBatch(row).map((u) => u.uid)),
  )

  function resetWizard() {
    setActiveStep(0)
    setBmrFile(null)
    setBatchRows([])
    setSummary(null)
    setParseError(null)
    setCartonFile(null)
    setCartonRows([])
    setCartonSummary(null)
    setCartonParseError(null)
  }

  async function handleValidateBmr() {
    if (!bmrFile) return
    setIsProcessing(true)
    setParseError(null)
    try {
      const { rows, summary } = await parseBmrFile(bmrFile)
      setBatchRows(rows)
      setSummary(summary)
      setActiveStep(1)
      const rejectedCount = summary.duplicateBatches + summary.invalidRanges
      if (rejectedCount > 0) {
        setToast({
          severity: 'warning',
          title: 'Some rows were rejected',
          message: `${rejectedCount} row(s) failed validation (${summary.duplicateBatches} duplicate, ${summary.invalidRanges} invalid range) and were excluded.`,
        })
      }
    } catch (err) {
      setParseError(
        err instanceof Error
          ? err.message
          : 'Failed to parse the uploaded file.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleConfirmImport() {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsProcessing(false)
    setActiveStep(3)
    onImported?.(
      batchRows.filter((row) => row.isValid),
      mappedBatches,
      bmrFile?.name ?? 'bmr-upload.xlsx',
    )
    setToast({
      severity: 'success',
      title: 'Import successful',
      message: 'Batch and UID data imported successfully.',
    })
  }

  async function handleValidateCartonFile() {
    if (!cartonFile) return
    setIsProcessing(true)
    setCartonParseError(null)
    try {
      const { rows, summary } = await parseMasterCartonFile(
        cartonFile,
        knownUids,
      )
      setCartonRows(rows)
      setCartonSummary(summary)
      if (summary.unknownUids + summary.duplicateUids > 0) {
        setToast({
          severity: 'warning',
          title: 'Some rows were rejected',
          message: `${summary.unknownUids} UID(s) not found in this import and ${summary.duplicateUids} duplicate UID(s) were excluded.`,
        })
      }
    } catch (err) {
      setCartonParseError(
        err instanceof Error
          ? err.message
          : 'Failed to parse the uploaded file.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleConfirmCartonImport() {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 700))
    setIsProcessing(false)
    setActiveStep(5)
    setToast({
      severity: 'success',
      title: 'Linkage imported',
      message: 'Master Carton & Inner Box linkage imported successfully.',
    })
  }

  return (
    <Stack spacing={3}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1 }}>
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <>
          <StepHeader
            icon={<FileSpreadsheet size={20} />}
            title="Upload Batch Manufacturing Report (BMR)"
            subtitle="Upload the daily BMR (.xlsx / .xls) to validate batches and generate UIDs from each batch's serial range."
          />
          <SectionCard title="BMR File">
            <FileDropzone
              file={bmrFile}
              onSelect={(f) => {
                setBmrFile(f)
                setParseError(null)
              }}
              onRemove={() => {
                setBmrFile(null)
                setParseError(null)
              }}
              accept=".xls,.xlsx"
              helperText="Must include Batch No., Start Serial Number, and End Serial Number columns"
            />
          </SectionCard>
          {parseError && <Alert severity="error">{parseError}</Alert>}
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              disabled={!bmrFile}
              loading={isProcessing}
              onClick={handleValidateBmr}
            >
              Validate & Continue
            </Button>
          </Stack>
        </>
      )}

      {activeStep === 1 && summary && (
        <>
          <StepHeader
            icon={<Layers size={20} />}
            title="Validate & Map Data"
            subtitle="Review the validation summary. UIDs are generated as Batch Number + Serial Number for each valid batch."
          />

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Batch Rows"
                value={summary.totalRows}
                icon={<FileSpreadsheet size={20} />}
                iconColor="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Valid Batches"
                value={summary.validRows}
                icon={<CircleCheck size={20} />}
                iconColor="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Rejected Batches"
                value={summary.duplicateBatches + summary.invalidRanges}
                icon={<ListChecks size={20} />}
                iconColor="error"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="UIDs Generated"
                value={summary.totalUidsGenerated}
                icon={<Layers size={20} />}
                iconColor="secondary"
              />
            </Grid>
          </Grid>

          {summary.duplicateBatches + summary.invalidRanges > 0 && (
            <Alert severity="warning">
              {summary.duplicateBatches} duplicate batch number(s) and{' '}
              {summary.invalidRanges} row(s) with an invalid serial range were
              excluded. Only valid batches will be imported and have UIDs
              generated.
            </Alert>
          )}

          <SectionCard title="BMR — Validation Summary">
            <CommonTable
              tableKey="bmr-validation"
              columns={batchColumns}
              rows={batchRows}
              getRowId={(row) => row.id}
              searchPlaceholder="Search batch rows…"
              searchKeys={(row) => `${row.batchNumber} ${row.productCode}`}
              emptyTitle="No batch rows"
            />
          </SectionCard>

          <SectionCard
            title={`Mapped Data — ${mappedBatches.length} Batches, ${summary.totalUidsGenerated.toLocaleString('en-IN')} UIDs`}
          >
            <ExpandableTable
              columns={mappedBatchColumns}
              rows={mappedBatches}
              getRowId={(row) => row.id}
              emptyTitle="No valid batches to map"
              renderExpanded={(batch) => {
                const sourceRow = batchRows.find((r) => r.id === batch.id)
                const uids = sourceRow
                  ? generateUidsForBatch(sourceRow).slice(0, 500)
                  : []
                return (
                  <CommonTable
                    tableKey={`uid-list-${batch.id}`}
                    columns={[
                      { key: 'uid', header: 'UID', render: (row) => row.uid },
                      {
                        key: 'serialNumber',
                        header: 'Serial Number',
                        render: (row) => row.serialNumber,
                      },
                    ]}
                    rows={uids}
                    getRowId={(row) => row.id}
                    searchPlaceholder="Search UIDs…"
                    searchKeys={(row) => row.uid}
                    emptyTitle="No UIDs generated for this batch"
                    emptyDescription={
                      batch.uidCount > 500
                        ? `Showing first 500 of ${batch.uidCount.toLocaleString('en-IN')} generated UIDs.`
                        : undefined
                    }
                  />
                )
              }}
            />
            {mappedBatches.some((b) => b.uidCount > 500) && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
              >
                Only the first 500 UIDs per batch are shown here for
                performance; all UIDs will be imported.
              </Typography>
            )}
          </SectionCard>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button variant="outlined" onClick={() => setActiveStep(0)}>
              Back
            </Button>
            <Button variant="contained" onClick={() => setActiveStep(2)}>
              Proceed to Import
            </Button>
          </Stack>
        </>
      )}

      {activeStep === 2 && summary && (
        <>
          <StepHeader
            icon={<ListChecks size={20} />}
            title="Import Confirmation"
            subtitle="Confirm the details below before importing this data into the system."
          />

          <SectionCard title="Import Summary">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  label="Batches to Import"
                  value={mappedBatches.length}
                  icon={<FileSpreadsheet size={20} />}
                  iconColor="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  label="Total UIDs to Import"
                  value={summary.totalUidsGenerated}
                  icon={<Layers size={20} />}
                  iconColor="secondary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StatCard
                  label="Valid Batches"
                  value={summary.validRows}
                  icon={<CircleCheck size={20} />}
                  iconColor="success"
                />
              </Grid>
            </Grid>
          </SectionCard>

          <Alert severity="info">
            This action will permanently import the validated batches and
            generate UIDs for each. Rows that failed validation have already
            been excluded and will not be imported.
          </Alert>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button variant="outlined" onClick={() => setActiveStep(1)}>
              Back
            </Button>
            <Button
              variant="contained"
              loading={isProcessing}
              onClick={handleConfirmImport}
            >
              Confirm Import
            </Button>
          </Stack>
        </>
      )}

      {activeStep === 3 && summary && (
        <Card sx={{ p: 3 }}>
          <Stack
            spacing={2.5}
            sx={{ alignItems: 'center', textAlign: 'center', py: 4 }}
          >
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
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              Data Imported Successfully
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', maxWidth: 480 }}
            >
              {mappedBatches.length} batches and{' '}
              {summary.totalUidsGenerated.toLocaleString('en-IN')} UIDs have
              been imported and are now available in Product Batches.
            </Typography>
            <Button variant="contained" onClick={() => setActiveStep(4)}>
              Continue to Master Carton Linkage
            </Button>
          </Stack>
        </Card>
      )}

      {activeStep === 4 && (
        <>
          <StepHeader
            icon={<Boxes size={20} />}
            title="Upload Master Carton & Inner Box Linkage"
            subtitle="Upload the linkage file (UID, Master Carton Number) to record which UIDs were packed into which master carton."
          />
          <Alert severity="info">
            Reference-only for now — this data isn't yet generated from
            line-side scanning. Each UID is checked against the batches just
            imported.
          </Alert>
          <SectionCard title="Master Carton Linkage File">
            <FileDropzone
              file={cartonFile}
              onSelect={(f) => {
                setCartonFile(f)
                setCartonParseError(null)
              }}
              onRemove={() => {
                setCartonFile(null)
                setCartonParseError(null)
                setCartonRows([])
                setCartonSummary(null)
              }}
              accept=".xls,.xlsx,.csv"
              helperText="Must include UID and Master Carton Number columns"
            />
          </SectionCard>
          {cartonParseError && (
            <Alert severity="error">{cartonParseError}</Alert>
          )}

          {cartonSummary && (
            <>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <StatCard
                    label="Total Rows"
                    value={cartonSummary.totalRows}
                    icon={<FileSpreadsheet size={20} />}
                    iconColor="primary"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <StatCard
                    label="Valid Rows"
                    value={cartonSummary.validRows}
                    icon={<CircleCheck size={20} />}
                    iconColor="success"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <StatCard
                    label="Unknown UIDs"
                    value={cartonSummary.unknownUids}
                    icon={<ListChecks size={20} />}
                    iconColor="error"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <StatCard
                    label="Duplicate UIDs"
                    value={cartonSummary.duplicateUids}
                    icon={<ListChecks size={20} />}
                    iconColor="warning"
                  />
                </Grid>
              </Grid>

              <SectionCard title="Master Carton Linkage — Preview">
                <CommonTable
                  tableKey="master-carton-linkage-preview"
                  columns={cartonLinkColumns}
                  rows={cartonRows}
                  getRowId={(row) => row.id}
                  searchPlaceholder="Search UIDs…"
                  searchKeys={(row) => `${row.uid} ${row.masterCartonNumber}`}
                  emptyTitle="No linkage rows"
                />
              </SectionCard>
            </>
          )}

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            {!cartonSummary ? (
              <Button
                variant="contained"
                disabled={!cartonFile}
                loading={isProcessing}
                onClick={handleValidateCartonFile}
              >
                Validate & Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                loading={isProcessing}
                disabled={cartonSummary.validRows === 0}
                onClick={handleConfirmCartonImport}
              >
                Confirm Import
              </Button>
            )}
          </Stack>
        </>
      )}

      {activeStep === 5 && cartonSummary && (
        <Card sx={{ p: 3 }}>
          <Stack
            spacing={2.5}
            sx={{ alignItems: 'center', textAlign: 'center', py: 4 }}
          >
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
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              Linkage Imported Successfully
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', maxWidth: 480 }}
            >
              {cartonSummary.validRows} UID(s) have been linked to their master
              carton numbers for reference.
            </Typography>
            <Button variant="contained" onClick={resetWizard}>
              Upload Another File
            </Button>
          </Stack>
        </Card>
      )}

      <Toast
        open={!!toast}
        title={toast?.title}
        message={toast?.message ?? ''}
        severity={toast?.severity ?? 'success'}
        onClose={() => setToast(null)}
      />
    </Stack>
  )
}
