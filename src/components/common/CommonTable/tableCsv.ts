import * as XLSX from 'xlsx'
import type { CommonTableColumn } from '@/components/common/CommonTable/CommonTable'

/** Renders a column's value as plain text for CSV export, preferring sortValue over the rendered node. */
function cellText<T>(column: CommonTableColumn<T>, row: T): string | number {
  if (column.sortValue) return column.sortValue(row)
  const rendered = column.render(row)
  return typeof rendered === 'string' || typeof rendered === 'number' ? rendered : ''
}

export function exportRowsToCsv<T>(
  columns: CommonTableColumn<T>[],
  rows: T[],
  fileName: string,
) {
  const data = rows.map((row) =>
    Object.fromEntries(columns.map((col) => [col.header, cellText(col, row)])),
  )
  const worksheet = XLSX.utils.json_to_sheet(data, { header: columns.map((col) => col.header) })
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export interface ParsedImportFile {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseImportFile(file: File): Promise<ParsedImportFile> {
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

        const headers = (matrix[0] ?? []).map((h) => String(h).trim())
        const rows = matrix.slice(1).map((row) =>
          Object.fromEntries(headers.map((header, i) => [header, String(row[i] ?? '').trim()])),
        )
        resolve({ headers, rows })
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not parse the file.'))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
