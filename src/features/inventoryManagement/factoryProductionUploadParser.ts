import * as XLSX from 'xlsx'
import type { FactoryProductionUploadRow } from '@/types/factoryProductionUpload'

const MAX_ROWS = 20000

const HEADER_ALIASES: Record<string, keyof FactoryProductionUploadRow> = {
  'productcode': 'productCode',
  'product code': 'productCode',
  'batchno': 'batchNo',
  'batch no': 'batchNo',
  'batch no.': 'batchNo',
  'productionplannumber': 'productionPlanNumber',
  'production plan number': 'productionPlanNumber',
  'batchissueddate': 'batchIssuedDate',
  'batch issued date': 'batchIssuedDate',
  'batchissuedbyname': 'batchIssuedByName',
  'batch issued by name': 'batchIssuedByName',
  'month': 'month',
  'qty': 'qty',
  'sampleqty': 'sampleQty',
  'sample qty': 'sampleQty',
  'plugtype': 'plugType',
  'plug type': 'plugType',
  'domestic': 'domestic',
  'export': 'export',
  'assylineno': 'assyLineNo',
  'assy line no': 'assyLineNo',
  'assy line no.': 'assyLineNo',
  'batchcompleteddate': 'batchCompletedDate',
  'batch completed date': 'batchCompletedDate',
  'producedqty': 'producedQty',
  'produced qty': 'producedQty',
  'startserialnumber': 'startSerialNumber',
  'start serial number': 'startSerialNumber',
  'endserialnumber': 'endSerialNumber',
  'end serial number': 'endSerialNumber',
  'mastercartonstartno': 'masterCartonStartNo',
  'master carton start no': 'masterCartonStartNo',
  'master carton start no.': 'masterCartonStartNo',
  'mastercartonendno': 'masterCartonEndNo',
  'master carton end no': 'masterCartonEndNo',
  'master carton end no.': 'masterCartonEndNo',
}

const NUMERIC_FIELDS: (keyof FactoryProductionUploadRow)[] = [
  'qty',
  'sampleQty',
  'domestic',
  'export',
  'producedQty',
  'startSerialNumber',
  'endSerialNumber',
  'masterCartonStartNo',
  'masterCartonEndNo',
]

const DATE_FIELDS: (keyof FactoryProductionUploadRow)[] = [
  'batchIssuedDate',
  'batchCompletedDate',
]

const TEMPLATE_HEADERS: (keyof FactoryProductionUploadRow)[] = [
  'productCode',
  'batchNo',
  'productionPlanNumber',
  'batchIssuedDate',
  'batchIssuedByName',
  'month',
  'qty',
  'sampleQty',
  'plugType',
  'domestic',
  'export',
  'assyLineNo',
  'batchCompletedDate',
  'producedQty',
  'startSerialNumber',
  'endSerialNumber',
  'masterCartonStartNo',
  'masterCartonEndNo',
]

const TEMPLATE_SAMPLE_ROW = [
  'S0H6-2',
  'S0H6-2-2504-00023',
  'PPN-2001',
  '2026-01-01',
  'Jane Doe',
  'January',
  1000,
  10,
  'Type A',
  1,
  0,
  'LINE-1',
  '2026-01-05',
  990,
  1,
  990,
  1,
  10,
]

/** Downloads a blank .xlsx with the exact column headers the upload parser expects, plus one sample row. */
export function downloadFactoryProductionUploadTemplate() {
  const worksheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, TEMPLATE_SAMPLE_ROW])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Production Upload Template')
  XLSX.writeFile(workbook, 'factory-production-upload-template.xlsx')
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase()
}

function excelDateToIso(value: unknown): string {
  if (typeof value === 'number') {
    return XLSX.SSF.format('yyyy-mm-dd', value)
  }
  const str = String(value ?? '').trim()

  // Already ISO (yyyy-mm-dd or yyyy-mm-ddThh:mm:ss...)
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
  }

  // dd-mm-yyyy or dd/mm/yyyy
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch
    return `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`
  }

  const parsed = new Date(str)
  return Number.isNaN(parsed.getTime()) ? str : parsed.toISOString().slice(0, 10)
}

export async function parseFactoryProductionFile(
  file: File,
): Promise<FactoryProductionUploadRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error('The uploaded file has no sheets.')
  const sheet = workbook.Sheets[sheetName]
  const matrix: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: '',
  })

  if (matrix.length < 2) throw new Error('The uploaded file has no data rows.')

  const headerRow = matrix[0]!.map((h) => normalizeHeader(String(h)))
  const fieldForColumn = headerRow.map((h) => HEADER_ALIASES[h])

  const requiredFields: (keyof FactoryProductionUploadRow)[] = [
    'productCode',
    'batchNo',
    'startSerialNumber',
    'endSerialNumber',
  ]
  const foundFields = new Set(fieldForColumn.filter(Boolean))
  const missing = requiredFields.filter((f) => !foundFields.has(f))
  if (missing.length > 0) {
    throw new Error(
      `The uploaded file is missing required column(s): ${missing.join(', ')}.`,
    )
  }

  const dataRows = matrix.slice(1, 1 + MAX_ROWS)

  return dataRows
    .filter((row) => row.some((cell) => String(cell).trim() !== ''))
    .map((row) => {
      const record: Partial<Record<keyof FactoryProductionUploadRow, unknown>> = {}
      fieldForColumn.forEach((field, colIndex) => {
        if (!field) return
        record[field] = row[colIndex]
      })

      const result: Record<keyof FactoryProductionUploadRow, unknown> =
        {} as Record<keyof FactoryProductionUploadRow, unknown>
      for (const key of TEMPLATE_HEADERS) {
        const raw = record[key]
        if (NUMERIC_FIELDS.includes(key)) {
          result[key] = Number(raw) || 0
        } else if (DATE_FIELDS.includes(key)) {
          result[key] = excelDateToIso(raw)
        } else {
          result[key] = String(raw ?? '').trim()
        }
      }
      return result as FactoryProductionUploadRow
    })
}
