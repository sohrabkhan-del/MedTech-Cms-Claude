import type {
  DispatchInvoice,
  DispatchLineItem,
  DispatchUploadRow,
} from '@/types/distributorUpload'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

/** Exact line items from the "DLR LIFECARE" Dispatch Loading Report (Invoice D-VP2627-0324) —
 *  the Distributor Upload details page must reproduce this manifest verbatim, same carton
 *  numbers and sequence, no fabricated values. */
const dlrLifecareLineItems: Omit<DispatchLineItem, 'id'>[] = [
  { srNo: 1, itemCode: 'S0BH1-6', itemName: 'Fingertip Pulse Oximeter OLED OG05 IN', cartonNo: '1177', cartonWeight: 9.7, dispatchQty: 96 },
  { srNo: 2, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54807', cartonWeight: 18.78, dispatchQty: 12 },
  { srNo: 3, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54809', cartonWeight: 18.74, dispatchQty: 12 },
  { srNo: 4, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54810', cartonWeight: 18.71, dispatchQty: 12 },
  { srNo: 5, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54813', cartonWeight: 18.74, dispatchQty: 12 },
  { srNo: 6, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54814', cartonWeight: 18.73, dispatchQty: 12 },
  { srNo: 7, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54815', cartonWeight: 18.72, dispatchQty: 12 },
  { srNo: 8, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54819', cartonWeight: 18.76, dispatchQty: 12 },
  { srNo: 9, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54823', cartonWeight: 18.74, dispatchQty: 12 },
  { srNo: 10, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54825', cartonWeight: 18.74, dispatchQty: 12 },
  { srNo: 11, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54829', cartonWeight: 18.68, dispatchQty: 12 },
  { srNo: 12, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54831', cartonWeight: 18.71, dispatchQty: 12 },
  { srNo: 13, itemCode: 'S0H7-1', itemName: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord', cartonNo: '54833', cartonWeight: 18.69, dispatchQty: 12 },
  { srNo: 14, itemCode: 'S0H6-1', itemName: 'Nebulizer HANDYNEB CLASSIC 230V-50Hz Indian Cord', cartonNo: '88837', cartonWeight: 17.36, dispatchQty: 12 },
  { srNo: 15, itemCode: 'S0H6-1', itemName: 'Nebulizer HANDYNEB CLASSIC 230V-50Hz Indian Cord', cartonNo: '88845', cartonWeight: 17.02, dispatchQty: 12 },
]

function buildInvoice(id: string, invoice: Omit<DispatchInvoice, 'id' | 'lineItems'>, lineItems: Omit<DispatchLineItem, 'id'>[]): DispatchInvoice {
  return {
    id,
    ...invoice,
    lineItems: lineItems.map((item) => ({ ...item, id: `${id}-item-${item.srNo}` })),
  }
}

const seedItemCatalog: { code: string; name: string }[] = [
  { code: 'S0H7-1', name: 'Nebulizer HANDYNEB SMART 230V-50Hz Indian Cord' },
  { code: 'S0H6-1', name: 'Nebulizer HANDYNEB CLASSIC 230V-50Hz Indian Cord' },
  { code: 'S0BH1-6', name: 'Fingertip Pulse Oximeter OLED OG05 IN' },
  { code: 'S0BP1-2', name: 'Blood Pressure Monitor BP11 Indian Cord' },
  { code: 'S0HP1-1', name: 'Heating Pad HandyPad HP-01' },
]
const seedCustomers = [
  'DLR LIFECARE',
  'MEDICARE DISTRIBUTORS',
  'APEX HEALTH SUPPLY',
  'SUNRISE PHARMA TRADERS',
  'NATIONAL MEDICAL AGENCY',
]
const seedTransporters = [
  'NCP PARCEL SERVICE',
  'SAFEXPRESS LOGISTICS',
  'BLUE DART CARGO',
  'VRL LOGISTICS',
]
const seedVehicleNumbers = [
  'MH-04-AB-1234',
  'GJ-01-CD-5678',
  'DL-08-EF-9012',
  'KA-05-GH-3456',
  'MH-12-IJ-7890',
  'RJ-14-KL-2345',
  'UP-16-MN-6789',
  'TN-09-OP-0123',
  'HR-26-QR-4567',
]

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function dateFromSeed(seed: number): string {
  const day = (seed % 27) + 1
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return `${pad(day, 2)} ${months[seed % months.length]} 2026`
}

function buildSeededInvoice(index: number): DispatchInvoice {
  const id = `dispatch-seed-${index}`
  const boxCount = seededNumber(index, 4, 20)
  const lineItems: Omit<DispatchLineItem, 'id'>[] = Array.from({ length: boxCount }).map((_, i) => {
    const item = seedItemCatalog[(index + i) % seedItemCatalog.length]!
    return {
      srNo: i + 1,
      itemCode: item.code,
      itemName: item.name,
      cartonNo: `${10000 + seededNumber(index * 7 + i, 0, 89000)}`,
      cartonWeight: Number((15 + seededNumber(index + i, 0, 500) / 100).toFixed(2)),
      dispatchQty: [6, 12, 24][seededNumber(index + i, 0, 3)]!,
    }
  })
  const totalBoxQty = lineItems.reduce((sum, item) => sum + item.dispatchQty, 0)

  return buildInvoice(
    id,
    {
      invoiceNo: `D-VP${2620 + index}-0${300 + index}`,
      customerName: seedCustomers[index % seedCustomers.length]!,
      transporter: seedTransporters[index % seedTransporters.length]!,
      vehicleNo: seedVehicleNumbers[index % seedVehicleNumbers.length]!,
      totalBoxQty,
      date: dateFromSeed(index),
      formatNo: 'FOR/7.5/05',
      revNo: '00',
      revDate: '00',
      uploadFile: 'seed-data',
      uploadedDate: `2026-0${1 + (index % 6)}-${pad(10 + (index % 18), 2)}`,
    },
    lineItems,
  )
}

// Distributor Upload listing is pre-seeded with sample dispatch invoices; uploads append more on top.
let dispatchInvoices: DispatchInvoice[] = [
  buildInvoice(
    'dispatch-dlr-lifecare-0324',
    {
      invoiceNo: 'D-VP2627-0324',
      customerName: 'DLR LIFECARE',
      transporter: 'NCP PARCEL SERVICE',
      vehicleNo: '',
      totalBoxQty: 15,
      date: '30 Jun 2026',
      formatNo: 'FOR/7.5/05',
      revNo: '00',
      revDate: '00',
      uploadFile: 'seed-data',
      uploadedDate: '2026-06-30',
    },
    dlrLifecareLineItems,
  ),
  ...Array.from({ length: 9 }, (_, i) => buildSeededInvoice(i + 1)),
]

export function getMockDispatchInvoices(): DispatchInvoice[] {
  return dispatchInvoices
}

export function getDispatchInvoiceById(id: string): DispatchInvoice | undefined {
  return dispatchInvoices.find((invoice) => invoice.id === id)
}

export function addDispatchInvoice(
  rows: DispatchUploadRow[],
  uploadFileName: string,
  invoiceMeta: DispatchInvoiceMeta,
): DispatchInvoice {
  const validRows = rows.filter((row) => row.isValid)
  const id = `dispatch-${invoiceMeta.invoiceNo}-${Date.now()}`
  const today = new Date().toISOString().slice(0, 10)

  const invoice = buildInvoice(
    id,
    {
      invoiceNo: invoiceMeta.invoiceNo,
      customerName: invoiceMeta.customerName,
      transporter: invoiceMeta.transporter,
      vehicleNo: invoiceMeta.vehicleNo,
      totalBoxQty: invoiceMeta.totalBoxQty || validRows.reduce((sum, r) => sum + r.dispatchQty, 0),
      date: invoiceMeta.date,
      formatNo: invoiceMeta.formatNo || 'FOR/7.5/05',
      revNo: invoiceMeta.revNo || '00',
      revDate: invoiceMeta.revDate || '00',
      uploadFile: uploadFileName,
      uploadedDate: today,
    },
    validRows.map((row) => ({
      srNo: row.srNo,
      itemCode: row.itemCode,
      itemName: row.itemName,
      cartonNo: row.cartonNo,
      cartonWeight: row.cartonWeight,
      dispatchQty: row.dispatchQty,
    })),
  )

  dispatchInvoices = [invoice, ...dispatchInvoices]
  return invoice
}
