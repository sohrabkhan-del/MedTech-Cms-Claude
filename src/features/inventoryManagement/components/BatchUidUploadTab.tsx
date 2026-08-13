import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
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
  Download,
  FileSpreadsheet,
  Layers,
  ListChecks,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SuccessDialog } from '@/components/common/SuccessDialog/SuccessDialog'
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
  downloadBmrUploadTemplate,
  downloadMasterCartonLinkTemplate,
  generateUidsForBatch,
  parseBmrFile,
  parseMasterCartonFile,
} from '@/features/inventoryManagement/mockBatchUidUpload'
import { useUploadFactoryProductionRowsMutation } from '@/features/inventoryManagement/services/factoryProductionUploadApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type {
  BmrBatchRow,
  BmrValidationSummary,
  MappedBatch,
  MasterCartonLinkRow,
  MasterCartonUploadSummary,
} from '@/types/batchUidUpload'
import type { FactoryProductionUploadRow } from '@/types/factoryProductionUpload'

const STEP_LABELS = [
  'Upload BMR',
  'Upload Carton Linkage',
  'Validate & Map Data',
  'Import Confirmation',
  'Import Success',
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
    align: 'center',
    minWidth: 90,
    render: (row) => row.qty.toLocaleString('en-IN'),
  },
  {
    key: 'sampleQty',
    header: 'Sample Qty',
    align: 'center',
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
    align: 'center',
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
    align: 'center',
    render: (row) => row.producedQty.toLocaleString('en-IN'),
  },
  {
    key: 'uidCount',
    header: 'UIDs Generated',
    align: 'center',
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
  onImported?: (
    batchRows: BmrBatchRow[],
    mappedBatches: MappedBatch[],
    uploadFileName: string,
    /** Distinct Master Carton count per batch number, derived from the uploaded carton linkage file. */
    containerCountByBatch: Record<string, number>,
  ) => void
  /** Called automatically a couple seconds after a successful import, to leave the wizard. */
  onDone?: () => void
}

export function BatchUidUploadTab({
  onImported,
  onDone,
}: BatchUidUploadTabProps = {}) {
  const [activeStep, setActiveStep] = useState(0)
  const [bmrFile, setBmrFile] = useState<File | null>(null)
  const [cartonFile, setCartonFile] = useState<File | null>(null)

  const [batchRows, setBatchRows] = useState<BmrBatchRow[]>([])
  const [summary, setSummary] = useState<BmrValidationSummary | null>(null)
  const [cartonRows, setCartonRows] = useState<MasterCartonLinkRow[]>([])
  const [cartonSummary, setCartonSummary] =
    useState<MasterCartonUploadSummary | null>(null)

  const [uploadRows] = useUploadFactoryProductionRowsMutation()
  const [isProcessing, setIsProcessing] = useState(false)
  const [validateError, setValidateError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    severity: 'success' | 'warning'
    title: string
    message: string
  } | null>(null)

  const mappedBatches = buildMappedBatches(batchRows)

  async function handleValidateAll() {
    if (!bmrFile || !cartonFile) return
    setIsProcessing(true)
    setValidateError(null)
    try {
      const { rows: bmrRows, summary: bmrSummary } = await parseBmrFile(bmrFile)
      const knownUids = new Set(
        bmrRows
          .filter((row) => row.isValid)
          .flatMap((row) => generateUidsForBatch(row).map((u) => u.uid)),
      )
      const { rows: linkRows, summary: linkSummary } =
        await parseMasterCartonFile(cartonFile, knownUids)

      setBatchRows(bmrRows)
      setSummary(bmrSummary)
      setCartonRows(linkRows)
      setCartonSummary(linkSummary)
      setActiveStep(2)

      const rejectedBatches =
        bmrSummary.duplicateBatches + bmrSummary.invalidRanges
      const rejectedLinks = linkSummary.unknownUids + linkSummary.duplicateUids
      if (rejectedBatches + rejectedLinks > 0) {
        setToast({
          severity: 'warning',
          title: 'Some rows were rejected',
          message: `${rejectedBatches} BMR row(s) and ${rejectedLinks} carton linkage row(s) failed validation and were excluded.`,
        })
      }
    } catch (err) {
      setValidateError(
        err instanceof Error
          ? err.message
          : 'Failed to parse the uploaded files.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  function countContainersByBatch(): Record<string, number> {
    const batchNumberByUid = new Map<string, string>()
    for (const row of batchRows) {
      if (!row.isValid) continue
      for (const generated of generateUidsForBatch(row)) {
        batchNumberByUid.set(generated.uid, row.batchNumber)
      }
    }

    const cartonsByBatch = new Map<string, Set<string>>()
    for (const link of cartonRows) {
      if (!link.isValid) continue
      const batchNumber = batchNumberByUid.get(link.uid)
      if (!batchNumber) continue
      const cartons = cartonsByBatch.get(batchNumber) ?? new Set<string>()
      cartons.add(link.masterCartonNumber)
      cartonsByBatch.set(batchNumber, cartons)
    }

    return Object.fromEntries(
      [...cartonsByBatch.entries()].map(([batchNumber, cartons]) => [
        batchNumber,
        cartons.size,
      ]),
    )
  }

  function isFilledCell(value: string): boolean {
    const normalized = value.trim().toLowerCase()
    return normalized !== '' && normalized !== 'nil'
  }

  /** Converts "DD-MM-YYYY" or "DD-Mon-YYYY" display strings to ISO "YYYY-MM-DD". */
  function toIsoDate(value: string): string {
    const trimmed = value.trim()
    const numericMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed)
    if (numericMatch) {
      const [, dd, mm, yyyy] = numericMatch
      return `${yyyy}-${mm}-${dd}`
    }
    const parsed = new Date(trimmed)
    return Number.isNaN(parsed.getTime()) ? trimmed : parsed.toISOString().slice(0, 10)
  }

  function cartonRangeByBatch(): Record<string, { start: number; end: number }> {
    const batchNumberByUid = new Map<string, string>()
    for (const row of batchRows) {
      if (!row.isValid) continue
      for (const generated of generateUidsForBatch(row)) {
        batchNumberByUid.set(generated.uid, row.batchNumber)
      }
    }

    const cartonNumbersByBatch = new Map<string, number[]>()
    for (const link of cartonRows) {
      if (!link.isValid) continue
      const batchNumber = batchNumberByUid.get(link.uid)
      if (!batchNumber) continue
      const cartonNumber = Number(link.masterCartonNumber.replace(/[^0-9]/g, ''))
      if (!Number.isFinite(cartonNumber) || cartonNumber <= 0) continue
      const numbers = cartonNumbersByBatch.get(batchNumber) ?? []
      numbers.push(cartonNumber)
      cartonNumbersByBatch.set(batchNumber, numbers)
    }

    return Object.fromEntries(
      [...cartonNumbersByBatch.entries()].map(([batchNumber, numbers]) => [
        batchNumber,
        { start: Math.min(...numbers), end: Math.max(...numbers) },
      ]),
    )
  }

  function toFactoryProductionRows(): FactoryProductionUploadRow[] {
    const cartonRanges = cartonRangeByBatch()
    return batchRows
      .filter((row) => row.isValid)
      .map((row) => {
        const range = cartonRanges[row.batchNumber]
        return {
          productCode: row.productCode,
          batchNo: row.batchNumber,
          productionPlanNumber: row.productionPlanNumber,
          batchIssuedDate: toIsoDate(row.batchIssuedDate),
          batchIssuedByName: row.batchIssuedByName,
          month: row.month,
          qty: row.qty,
          sampleQty: row.sampleQty,
          plugType: row.plugType,
          domestic: isFilledCell(row.domestic) ? 1 : 0,
          export: isFilledCell(row.export) ? 1 : 0,
          assyLineNo: row.assyLineNo,
          batchCompletedDate: toIsoDate(row.batchCompletedDate),
          producedQty: row.producedQty,
          startSerialNumber: Number(row.startSerialNumber),
          endSerialNumber: Number(row.endSerialNumber),
          masterCartonStartNo: range?.start ?? 0,
          masterCartonEndNo: range?.end ?? 0,
        }
      })
  }

  async function handleConfirmImport() {
    setIsProcessing(true)
    setValidateError(null)
    try {
      await uploadRows({ rows: toFactoryProductionRows() }).unwrap()
      setActiveStep(4)
      onImported?.(
        batchRows.filter((row) => row.isValid),
        mappedBatches,
        bmrFile?.name ?? 'bmr-upload.xlsx',
        countContainersByBatch(),
      )
      setToast({
        severity: 'success',
        title: 'Import successful',
        message:
          'Batch, UID, and Master Carton linkage data imported successfully.',
      })
      if (onDone) {
        setTimeout(onDone, 2000)
      }
    } catch (err) {
      setValidateError(getApiErrorMessage(err, 'Failed to import the validated data.'))
    } finally {
      setIsProcessing(false)
    }
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
            subtitle="Upload the daily BMR (.xlsx / .xls). Batches and UIDs will be validated after both files are selected."
          />
          <SectionCard title="BMR File">
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ justifyContent: 'flex-end', mb: 1.5, flexWrap: 'wrap', rowGap: 1 }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<Download size={16} />}
                onClick={downloadBmrUploadTemplate}
              >
                Download BMR Template
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Download size={16} />}
                onClick={downloadMasterCartonLinkTemplate}
              >
                Download Carton Linkage Template
              </Button>
            </Stack>
            <FileDropzone
              file={bmrFile}
              onSelect={(f) => {
                setBmrFile(f)
                setValidateError(null)
              }}
              onRemove={() => {
                setBmrFile(null)
                setValidateError(null)
              }}
              accept=".xls,.xlsx"
              helperText="Must include Batch No., Start Serial Number, and End Serial Number columns"
            />
          </SectionCard>
          <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              disabled={!bmrFile}
              onClick={() => setActiveStep(1)}
            >
              Continue
            </Button>
          </Stack>
        </>
      )}

      {activeStep === 1 && (
        <>
          <StepHeader
            icon={<Boxes size={20} />}
            title="Upload Master Carton & Inner Box Linkage"
            subtitle="Upload the linkage file (UID, Master Carton Number). Reference-only for now — this will be replaced by real line-side scan data."
          />
          <SectionCard title="Master Carton Linkage File">
            <Stack
              direction="row"
              sx={{ justifyContent: 'flex-end', mb: 1.5 }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<Download size={16} />}
                onClick={downloadMasterCartonLinkTemplate}
              >
                Download Carton Linkage Template
              </Button>
            </Stack>
            <FileDropzone
              file={cartonFile}
              onSelect={(f) => {
                setCartonFile(f)
                setValidateError(null)
              }}
              onRemove={() => {
                setCartonFile(null)
                setValidateError(null)
              }}
              accept=".xls,.xlsx,.csv"
              helperText="Must include UID and Master Carton Number columns"
            />
          </SectionCard>
          {validateError && <Alert severity="error">{validateError}</Alert>}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button variant="outlined" onClick={() => setActiveStep(0)}>
              Back
            </Button>
            <Button
              variant="contained"
              disabled={!cartonFile}
              loading={isProcessing}
              onClick={handleValidateAll}
            >
              Validate
            </Button>
          </Stack>
        </>
      )}

      {activeStep === 2 && summary && cartonSummary && (
        <>
          <StepHeader
            icon={<Layers size={20} />}
            title="Validate & Map Data"
            subtitle="Review the validation summary for both the BMR and the Master Carton linkage. UIDs are generated as Batch Number + Serial Number for each valid batch."
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
              searchKeys={(row) =>
                [
                  row.productCode,
                  row.batchNumber,
                  row.productionPlanNumber,
                  row.batchIssuedDate,
                  row.batchIssuedByName,
                  row.month,
                  row.qty,
                  row.sampleQty,
                  row.plugType,
                  row.domestic,
                  row.export,
                  row.assyLineNo,
                  row.batchCompletedDate,
                  row.producedQty,
                  row.startSerialNumber,
                  row.endSerialNumber,
                  row.isValid ? 'Valid' : row.validationNote,
                ]
                  .filter((value) => value !== undefined && value !== null)
                  .join(' ')
              }
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

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Linkage Rows"
                value={cartonSummary.totalRows}
                icon={<FileSpreadsheet size={20} />}
                iconColor="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <StatCard
                label="Valid Links"
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

          {cartonSummary.unknownUids + cartonSummary.duplicateUids > 0 && (
            <Alert severity="warning">
              {cartonSummary.unknownUids} UID(s) not found in this BMR import
              and {cartonSummary.duplicateUids} duplicate UID(s) were excluded
              from the carton linkage.
            </Alert>
          )}

          <SectionCard title="Master Carton Linkage — Mapping">
            <CommonTable
              tableKey="master-carton-linkage-preview"
              columns={cartonLinkColumns}
              rows={cartonRows}
              getRowId={(row) => row.id}
              searchPlaceholder="Search UIDs…"
              searchKeys={(row) =>
                [
                  row.uid,
                  row.masterCartonNumber,
                  row.isValid ? 'Valid' : row.validationNote,
                ]
                  .filter((value) => value !== undefined && value !== null)
                  .join(' ')
              }
              emptyTitle="No linkage rows"
            />
          </SectionCard>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button variant="outlined" onClick={() => setActiveStep(1)}>
              Back
            </Button>
            <Button variant="contained" onClick={() => setActiveStep(3)}>
              Proceed to Import
            </Button>
          </Stack>
        </>
      )}

      {activeStep === 3 && summary && cartonSummary && (
        <>
          <StepHeader
            icon={<ListChecks size={20} />}
            title="Import Confirmation"
            subtitle="Confirm the details below before importing this data into the system."
          />

          <SectionCard title="Import Summary">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatCard
                  label="Batches to Import"
                  value={mappedBatches.length}
                  icon={<FileSpreadsheet size={20} />}
                  iconColor="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <StatCard
                  label="Total UIDs to Import"
                  value={summary.totalUidsGenerated}
                  icon={<Layers size={20} />}
                  iconColor="secondary"
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
                  label="Carton Links to Import"
                  value={cartonSummary.validRows}
                  icon={<Boxes size={20} />}
                  iconColor="warning"
                />
              </Grid>
            </Grid>
          </SectionCard>

          <Alert severity="info">
            This action will permanently import the validated batches, generate
            UIDs for each, and record the Master Carton linkage for reference.
            Rows that failed validation have already been excluded and will not
            be imported.
          </Alert>

          {validateError && <Alert severity="error">{validateError}</Alert>}

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button variant="outlined" onClick={() => setActiveStep(2)}>
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

      {activeStep === 4 && summary && cartonSummary && (
        <SuccessDialog
          open={activeStep === 4}
          onClose={() => {}}
          title="Data Imported Successfully"
          description={`${mappedBatches.length} batches, ${summary.totalUidsGenerated.toLocaleString('en-IN')} UIDs, and ${cartonSummary.validRows} master carton link(s) have been imported and are now available in Product Batches.`}
          autoCloseMs={2500}
          variant="success"
        />
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
