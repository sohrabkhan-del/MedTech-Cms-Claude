import * as XLSX from 'xlsx'
import type { FactoryProductionUploadRow } from '@/types/factoryProductionUpload'

const MAX_ROWS = 20000

const HEADER_ALIASES: Record<string, keyof FactoryProductionUploadRow> = {
  'productcode': 'ProductCode',
  'product code': 'ProductCode',
  'batchno': 'BatchNo',
  'batch no': 'BatchNo',
  'batch no.': 'BatchNo',
  'productionplannumber': 'ProductionPlanNumber',
  'production plan number': 'ProductionPlanNumber',
  'batchissueddate': 'BatchIssuedDate',
  'batch issued date': 'BatchIssuedDate',
  'batchissuedbyname': 'BatchIssuedByName',
  'batch issued by name': 'BatchIssuedByName',
  'month': 'Month',
  'qty': 'Qty',
  'sampleqty': 'SampleQty',
  'sample qty': 'SampleQty',
  'plugtype': 'PlugType',
  'plug type': 'PlugType',
  'domestic': 'Domestic',
  'export': 'Export',
  'assylineno': 'AssyLineNo',
  'assy line no': 'AssyLineNo',
  'assy line no.': 'AssyLineNo',
  'batchcompleteddate': 'BatchCompletedDate',
  'batch completed date': 'BatchCompletedDate',
  'producedqty': 'ProducedQty',
  'produced qty': 'ProducedQty',
  'startserialnumber': 'StartSerialNumber',
  'start serial number': 'StartSerialNumber',
  'endserialnumber': 'EndSerialNumber',
  'end serial number': 'EndSerialNumber',
  'mastercartonstartno': 'MasterCartonStartNo',
  'master carton start no': 'MasterCartonStartNo',
  'master carton start no.': 'MasterCartonStartNo',
  'mastercartonendno': 'MasterCartonEndNo',
  'master carton end no': 'MasterCartonEndNo',
  'master carton end no.': 'MasterCartonEndNo',
}

const NUMERIC_FIELDS: (keyof FactoryProductionUploadRow)[] = [
  'Qty',
  'SampleQty',
  'Domestic',
  'Export',
  'ProducedQty',
  'StartSerialNumber',
  'EndSerialNumber',
  'MasterCartonStartNo',
  'MasterCartonEndNo',
]

const DATE_FIELDS: (keyof FactoryProductionUploadRow)[] = [
  'BatchIssuedDate',
  'BatchCompletedDate',
]

const TEMPLATE_HEADERS: (keyof FactoryProductionUploadRow)[] = [
  'ProductCode',
  'BatchNo',
  'ProductionPlanNumber',
  'BatchIssuedDate',
  'BatchIssuedByName',
  'Month',
  'Qty',
  'SampleQty',
  'PlugType',
  'Domestic',
  'Export',
  'AssyLineNo',
  'BatchCompletedDate',
  'ProducedQty',
  'StartSerialNumber',
  'EndSerialNumber',
  'MasterCartonStartNo',
  'MasterCartonEndNo',
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
    'ProductCode',
    'BatchNo',
    'StartSerialNumber',
    'EndSerialNumber',
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

      const result = {} as FactoryProductionUploadRow
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
      return result
    })
}
