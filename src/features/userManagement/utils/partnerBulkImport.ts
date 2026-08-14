import * as XLSX from 'xlsx'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'
import type { PartnerBulkRow } from '@/features/userManagement/services/partnersBulkApi'

export const PARTNER_BULK_TEMPLATE_HEADERS = [
  'email',
  'phone',
  'type',
  'businessName',
  'ownerName',
  'gstNumber',
  'regionCode',
  'mrEmail',
  'outletName',
  'addressLine1',
  'city',
  'state',
  'pincode',
] as const

const SAMPLE_ROWS: Record<string, string>[] = [
  {
    email: 'dealer1@example.com',
    phone: '9876543210',
    type: 'DEALER',
    businessName: 'Sharma Medical Distributors',
    ownerName: 'Rajesh Sharma',
    gstNumber: '27AAAPL1234C1Z5',
    regionCode: 'NORTH',
    mrEmail: 'mr.singh@example.com',
    outletName: 'Sharma Medical Store',
    addressLine1: '12 MG Road',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
  },
  {
    email: 'chemist1@example.com',
    phone: '9123456780',
    type: 'CHEMIST',
    businessName: 'City Pharmacy',
    ownerName: 'Anita Verma',
    gstNumber: '',
    regionCode: 'NORTH',
    mrEmail: 'mr.singh@example.com',
    outletName: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  },
]

/** Downloads a fillable .xlsx template for the partner bulk-upload flow, pre-populated with example rows. */
export function downloadPartnerBulkTemplate(fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS, {
    header: [...PARTNER_BULK_TEMPLATE_HEADERS],
  })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Partners')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const REQUIRED_FIELDS = [
  'email',
  'phone',
  'businessName',
  'ownerName',
  'regionCode',
  'mrEmail',
] as const

/** Converts parsed spreadsheet rows into `/partners/bulk` rows, forcing `type` and validating required fields. */
export function mapParsedRowsToPartnerBulk(
  parsed: ParsedImportFile,
  type: 'DEALER' | 'CHEMIST',
): { rows: PartnerBulkRow[]; errors: string[] } {
  const rows: PartnerBulkRow[] = []
  const errors: string[] = []

  parsed.rows.forEach((row, i) => {
    const missing = REQUIRED_FIELDS.filter((field) => !row[field]?.trim())
    if (missing.length > 0) {
      errors.push(`Row ${i + 2}: missing ${missing.join(', ')}`)
      return
    }

    rows.push({
      email: row.email.trim(),
      phone: row.phone.trim(),
      type,
      businessName: row.businessName.trim(),
      ownerName: row.ownerName.trim(),
      gstNumber: row.gstNumber?.trim() || undefined,
      regionCode: row.regionCode.trim(),
      mrEmail: row.mrEmail.trim(),
      outletName: row.outletName?.trim() || undefined,
      addressLine1: row.addressLine1?.trim() || undefined,
      city: row.city?.trim() || undefined,
      state: row.state?.trim() || undefined,
      pincode: row.pincode?.trim() || undefined,
    })
  })

  return { rows, errors }
}
