import * as XLSX from 'xlsx'
import type { BmrBatchRow, BmrValidationSummary, GeneratedUid, MappedBatch } from '@/types/batchUidUpload'

const MAX_ROWS = 5000
const MAX_UIDS_PER_BATCH = 200_000

const HEADER_ALIASES: Record<string, keyof RawBmrRecord> = {
  'product code': 'productCode',
  'batch no.': 'batchNumber',
  'batch no': 'batchNumber',
  'batch number': 'batchNumber',
  'production plan number': 'productionPlanNumber',
  'batch issued date': 'batchIssuedDate',
  'batch issued by name': 'batchIssuedByName',
  month: 'month',
  qty: 'qty',
  'sample qty': 'sampleQty',
  'plug type': 'plugType',
  domestic: 'domesticExport',
  export: 'domesticExport',
  'assy line no.': 'assyLineNo',
  'assy line no': 'assyLineNo',
  'batch completed date': 'batchCompletedDate',
  'produced qty': 'producedQty',
  'start serial number': 'startSerialNumber',
  'end serial number': 'endSerialNumber',
}

interface RawBmrRecord {
  productCode: string
  batchNumber: string
  productionPlanNumber: string
  batchIssuedDate: string
  batchIssuedByName: string
  month: string
  qty: string
  sampleQty: string
  plugType: string
  domesticExport: string
  assyLineNo: string
  batchCompletedDate: string
  producedQty: string
  startSerialNumber: string
  endSerialNumber: string
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase()
}

function excelDateToString(value: unknown): string {
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.format('dd-mmm-yyyy', value)
    return parsed
  }
  return String(value ?? '').trim()
}

/** Pulls the trailing numeric run of a serial string, e.g. "SN-001499" -> 1499. */
function extractTrailingNumber(serial: string): { prefix: string; digits: number; width: number } | null {
  const match = /^(.*?)(\d+)$/.exec(serial.trim())
  if (!match) return null
  const [, prefix, digitsStr] = match
  return { prefix, digits: Number(digitsStr), width: digitsStr.length }
}

export interface ParsedBmrResult {
  rows: BmrBatchRow[]
  summary: BmrValidationSummary
}

export async function parseBmrFile(file: File): Promise<ParsedBmrResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('The uploaded file has no sheets.')
  const sheet = workbook.Sheets[sheetName]
  const matrix: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' })

  if (matrix.length < 2) throw new Error('The uploaded file has no data rows.')

  const headerRow = matrix[0]!.map((h) => normalizeHeader(String(h)))
  const fieldForColumn = headerRow.map((h) => HEADER_ALIASES[h])

  const requiredFields: (keyof RawBmrRecord)[] = ['batchNumber', 'startSerialNumber', 'endSerialNumber']
  const foundFields = new Set(fieldForColumn.filter(Boolean))
  const missing = requiredFields.filter((f) => !foundFields.has(f))
  if (missing.length > 0) {
    throw new Error(`The uploaded file is missing required column(s): ${missing.join(', ')}.`)
  }

  const dataRows = matrix.slice(1, 1 + MAX_ROWS)
  const seenBatchNumbers = new Set<string>()
  let totalUidsGenerated = 0

  const rows: BmrBatchRow[] = dataRows
    .filter((row) => row.some((cell) => String(cell).trim() !== ''))
    .map((row, index) => {
      const record: Partial<RawBmrRecord> = {}
      fieldForColumn.forEach((field, colIndex) => {
        if (!field) return
        const cell = row[colIndex]
        record[field] = field.endsWith('Date') ? excelDateToString(cell) : String(cell ?? '').trim()
      })

      const batchNumber = record.batchNumber ?? ''
      const startSerialNumber = record.startSerialNumber ?? ''
      const endSerialNumber = record.endSerialNumber ?? ''

      const isDuplicate = batchNumber !== '' && seenBatchNumbers.has(batchNumber)
      if (batchNumber !== '') seenBatchNumbers.add(batchNumber)

      const start = extractTrailingNumber(startSerialNumber)
      const end = extractTrailingNumber(endSerialNumber)
      const rangeValid = !!start && !!end && start.prefix === end.prefix && end.digits >= start.digits
      const uidCount = rangeValid ? end!.digits - start!.digits + 1 : 0

      let validationNote: string | undefined
      if (isDuplicate) validationNote = 'Duplicate batch number'
      else if (!batchNumber) validationNote = 'Missing batch number'
      else if (!start || !end) validationNote = 'Invalid serial number format'
      else if (!rangeValid) validationNote = 'End serial precedes start serial'

      const isValid = !validationNote
      if (isValid) totalUidsGenerated += Math.min(uidCount, MAX_UIDS_PER_BATCH)

      return {
        id: `bmr-row-${index}`,
        productCode: record.productCode ?? '',
        batchNumber,
        productionPlanNumber: record.productionPlanNumber ?? '',
        batchIssuedDate: record.batchIssuedDate ?? '',
        batchIssuedByName: record.batchIssuedByName ?? '',
        month: record.month ?? '',
        qty: Number(record.qty) || 0,
        sampleQty: Number(record.sampleQty) || 0,
        plugType: record.plugType ?? '',
        domesticExport: record.domesticExport ?? '',
        assyLineNo: record.assyLineNo ?? '',
        batchCompletedDate: record.batchCompletedDate ?? '',
        producedQty: Number(record.producedQty) || 0,
        startSerialNumber,
        endSerialNumber,
        isValid,
        validationNote,
      }
    })

  const summary: BmrValidationSummary = {
    totalRows: rows.length,
    validRows: rows.filter((r) => r.isValid).length,
    duplicateBatches: rows.filter((r) => r.validationNote === 'Duplicate batch number').length,
    invalidRanges: rows.filter(
      (r) => r.validationNote === 'End serial precedes start serial' || r.validationNote === 'Invalid serial number format',
    ).length,
    totalUidsGenerated,
  }

  return { rows, summary }
}

/**
 * UID = BATCH NUMBER + "_" + serial number, expanded across the batch's start–end serial range.
 * Caps generation per batch to avoid freezing the tab on a bad/huge range.
 */
export function generateUidsForBatch(batch: BmrBatchRow): GeneratedUid[] {
  const start = extractTrailingNumber(batch.startSerialNumber)
  const end = extractTrailingNumber(batch.endSerialNumber)
  if (!start || !end || start.prefix !== end.prefix || end.digits < start.digits) return []

  const count = Math.min(end.digits - start.digits + 1, MAX_UIDS_PER_BATCH)
  const uids: GeneratedUid[] = []
  for (let i = 0; i < count; i++) {
    const serialDigits = start.digits + i
    const serialNumber = `${start.prefix}${String(serialDigits).padStart(start.width, '0')}`
    uids.push({
      id: `${batch.id}-${serialNumber}`,
      uid: `${batch.batchNumber}_${serialNumber}`,
      serialNumber,
      batchNumber: batch.batchNumber,
      productCode: batch.productCode,
    })
  }
  return uids
}

export function buildMappedBatches(batchRows: BmrBatchRow[]): MappedBatch[] {
  return batchRows
    .filter((batch) => batch.isValid)
    .map((batch) => {
      const start = extractTrailingNumber(batch.startSerialNumber)
      const end = extractTrailingNumber(batch.endSerialNumber)
      const uidCount = start && end ? Math.min(end.digits - start.digits + 1, MAX_UIDS_PER_BATCH) : 0
      return {
        id: batch.id,
        batchNumber: batch.batchNumber,
        productCode: batch.productCode,
        producedQty: batch.producedQty,
        uidCount,
        startSerialNumber: batch.startSerialNumber,
        endSerialNumber: batch.endSerialNumber,
      }
    })
}
