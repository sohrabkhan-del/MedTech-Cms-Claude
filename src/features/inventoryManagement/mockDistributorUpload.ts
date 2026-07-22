import type { DistributorUploadRow, DistributorUploadSummary } from '@/types/distributorUpload'

const distributorNames = ['Apex Pharma Distributors', 'Nova Health Supply Co.', 'Sunrise Medical Traders', 'Metro Pharma Logistics', 'Everest Distribution House']
const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai']
const regions: DistributorUploadRow['region'][] = ['North', 'South', 'East', 'West']

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

export function generateMockDistributorRows(fileName: string): { rows: DistributorUploadRow[]; summary: DistributorUploadSummary } {
  const seed = fileName.length + fileName.charCodeAt(0)
  const rowCount = 6 + (seed % 4)

  const rows: DistributorUploadRow[] = Array.from({ length: rowCount }).map((_, index) => {
    const isDuplicate = index === 3
    const isInvalidGst = index === 5 % rowCount
    const isValid = !isDuplicate && !isInvalidGst

    return {
      id: `distributor-row-${index}`,
      distributorName: distributorNames[index % distributorNames.length]!,
      distributorCode: isDuplicate ? 'DIST-1002' : `DIST-${pad(1000 + index, 4)}`,
      contactPerson: `Contact Person ${index + 1}`,
      phone: `98${pad(10000000 + index * 137, 8)}`,
      email: `distributor${index + 1}@example.com`,
      city: cities[index % cities.length]!,
      region: regions[index % regions.length]!,
      gstNumber: isInvalidGst ? 'INVALIDGST123' : `27AAAPL${pad(1234 + index, 4)}C1ZV`,
      isValid,
      validationNote: isDuplicate ? 'Duplicate distributor code' : isInvalidGst ? 'Invalid GST format' : undefined,
    }
  })

  const summary: DistributorUploadSummary = {
    totalRows: rows.length,
    validRows: rows.filter((r) => r.isValid).length,
    duplicateCodes: rows.filter((r) => r.validationNote === 'Duplicate distributor code').length,
    invalidGst: rows.filter((r) => r.validationNote === 'Invalid GST format').length,
  }

  return { rows, summary }
}
