import * as XLSX from 'xlsx'
import type { DispatchUploadRow, DispatchUploadSummary } from '@/types/distributorUpload'

export interface DispatchInvoiceMeta {
  invoiceNo: string
  customerName: string
  transporter: string
  vehicleNo: string
  totalBoxQty: number
  date: string
  formatNo: string
  revNo: string
  revDate: string
}

export interface ParsedDispatchReport {
  meta: DispatchInvoiceMeta
  rows: DispatchUploadRow[]
  summary: DispatchUploadSummary
}

const TABLE_HEADER_MARKER = 'sr'

/** Finds the cell value immediately to the right of a label cell (e.g. "CUSTOMER NAME :" -> next non-empty cell). */
function findLabelValue(matrix: unknown[][], labelPattern: RegExp): string {
  for (const row of matrix) {
    for (let col = 0; col < row.length; col++) {
      const cell = String(row[col] ?? '').trim()
      if (labelPattern.test(cell)) {
        for (let next = col + 1; next < row.length; next++) {
          const value = String(row[next] ?? '').trim()
          if (value) return value
        }
      }
    }
  }
  return ''
}

function findTableHeaderRowIndex(matrix: unknown[][]): number {
  return matrix.findIndex((row) =>
    row.some((cell) => String(cell ?? '').trim().toLowerCase().startsWith(TABLE_HEADER_MARKER)),
  )
}

function toNumber(value: unknown): number {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** Parses a "Dispatch Loading Report" workbook exactly as exported by the factory (customer/transporter/
 *  invoice header block, then a Sr. No./Item Code/Item Name/Carton No./Carton Weight/Dispatch Qty table,
 *  ending in a "Total" row). No manual data entry — every field is read straight from the file. */
export function parseDispatchReportFile(file: File): Promise<ParsedDispatchReport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.onload = () => {
      try {
        const workbook = XLSX.read(reader.result, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) throw new Error('The file has no sheets.')
        const sheet = workbook.Sheets[sheetName]
        const matrix: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          blankrows: false,
          defval: '',
        })
        if (matrix.length < 1) throw new Error('The file is empty.')

        const customerName = findLabelValue(matrix, /^customer\s*name\s*:?$/i)
        const transporter = findLabelValue(matrix, /^transporter\s*:?$/i)
        const invoiceNo = findLabelValue(matrix, /^invoice\s*no\.?\s*:?$/i)
        const totalBoxQty = toNumber(findLabelValue(matrix, /^total\s*box\s*qty\.?\s*:?$/i))
        const vehicleNo = findLabelValue(matrix, /^vehicle\s*no\.?\s*:?$/i)
        const date = findLabelValue(matrix, /^date\s*:?$/i)
        const formatNo = findLabelValue(matrix, /^format\s*no\.?\s*:?$/i)
        const revNo = findLabelValue(matrix, /^rev\.?\s*no\.?\s*:?$/i)
        const revDate = findLabelValue(matrix, /^rev\.?\s*date\s*:?$/i)

        if (!customerName || !invoiceNo) {
          throw new Error(
            'Could not find Customer Name / Invoice No. in this file. Make sure it is a Dispatch Loading Report export.',
          )
        }

        const headerRowIndex = findTableHeaderRowIndex(matrix)
        if (headerRowIndex === -1) {
          throw new Error('Could not find the item table (Sr. No. / Item Code / Item Name…) in this file.')
        }
        const headerRow = matrix[headerRowIndex]!.map((h) => String(h).trim().toLowerCase())
        const colIndex = (pattern: RegExp) => headerRow.findIndex((h) => pattern.test(h))
        const srNoCol = colIndex(/^sr/)
        const itemCodeCol = colIndex(/item\s*code/)
        const itemNameCol = colIndex(/item\s*name/)
        const cartonNoCol = colIndex(/carton\s*no/)
        const cartonWeightCol = colIndex(/carton\s*weight/)
        const dispatchQtyCol = colIndex(/dispatch\s*qty/)

        const dataRows = matrix.slice(headerRowIndex + 1)
        const cartonNoCounts = new Map<string, number>()
        const rows: DispatchUploadRow[] = []

        for (const row of dataRows) {
          const srNoRaw = String(row[srNoCol] ?? '').trim()
          if (!srNoRaw || /^total$/i.test(srNoRaw)) continue
          if (/^total$/i.test(String(row[itemNameCol] ?? '').trim())) continue

          const cartonNo = String(row[cartonNoCol] ?? '').trim()
          if (cartonNo) cartonNoCounts.set(cartonNo, (cartonNoCounts.get(cartonNo) ?? 0) + 1)

          rows.push({
            id: `dispatch-row-${srNoRaw}`,
            srNo: toNumber(srNoRaw),
            itemCode: String(row[itemCodeCol] ?? '').trim(),
            itemName: String(row[itemNameCol] ?? '').trim(),
            cartonNo,
            cartonWeight: toNumber(row[cartonWeightCol]),
            dispatchQty: toNumber(row[dispatchQtyCol]),
            isValid: true,
          })
        }

        for (const row of rows) {
          if (row.cartonNo && (cartonNoCounts.get(row.cartonNo) ?? 0) > 1) {
            row.isValid = false
            row.validationNote = 'Duplicate carton number'
          } else if (row.cartonWeight <= 0) {
            row.isValid = false
            row.validationNote = 'Invalid carton weight'
          }
        }

        if (rows.length === 0) {
          throw new Error('No item rows were found under the table header.')
        }

        const summary: DispatchUploadSummary = {
          totalRows: rows.length,
          validRows: rows.filter((r) => r.isValid).length,
          duplicateCartons: rows.filter((r) => r.validationNote === 'Duplicate carton number').length,
          invalidWeights: rows.filter((r) => r.validationNote === 'Invalid carton weight').length,
        }

        resolve({
          meta: {
            invoiceNo,
            customerName,
            transporter,
            vehicleNo,
            totalBoxQty: totalBoxQty || rows.reduce((sum, r) => sum + r.dispatchQty, 0),
            date,
            formatNo,
            revNo,
            revDate,
          },
          rows,
          summary,
        })
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not parse the file.'))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
