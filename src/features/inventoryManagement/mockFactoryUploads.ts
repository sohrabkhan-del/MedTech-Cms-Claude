import type {
  BatchContainer,
  BatchScanEntry,
  ContainerBox,
  FactoryBatch,
} from '@/types/factoryUpload'
import type { BmrBatchRow } from '@/types/batchUidUpload'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, '0')
}

/** Exact rows from the "S0H6 Handyneb Classic Nebulizer" BMR manifest — the Active Product
 *  Registry Directory listing must match this manifest verbatim (no fabricated values). */
interface BmrManifestRow {
  productCode: string
  batchNumber: string
  productionPlanNumber: string
  batchIssuedDate: string
  issuedBy: string
  month: string
  qty: number
  sampleQty: number
  plugType: string
  domestic: string
  export: string
  assemblyLine: string
  batchCompletionDate: string
  producedQty: number
  startSerialNumber: string
  endSerialNumber: string
}

const bmrManifestRows: BmrManifestRow[] = [
  {
    productCode: 'S0H6-2',
    batchNumber: 'S0H6-2-2504-00023',
    productionPlanNumber: 'VMFG-PP-2526-00024',
    batchIssuedDate: '10-04-2025',
    issuedBy: 'Viraj',
    month: 'Apr-25',
    qty: 1,
    sampleQty: 0,
    plugType: 'EURO',
    domestic: '',
    export: '',
    assemblyLine: '2',
    batchCompletionDate: '10-04-2025',
    producedQty: 1,
    startSerialNumber: '896955',
    endSerialNumber: '896955',
  },
  {
    productCode: 'S0H6-1',
    batchNumber: 'S0H6-1-2504-00030',
    productionPlanNumber: 'VMFG-PP-2526-00031',
    batchIssuedDate: '15-04-2025',
    issuedBy: 'Viraj',
    month: 'Apr-25',
    qty: 2004,
    sampleQty: 0,
    plugType: 'Indian',
    domestic: 'Domestic',
    export: 'Nil',
    assemblyLine: '',
    batchCompletionDate: '16-04-2025',
    producedQty: 1848,
    startSerialNumber: '896956',
    endSerialNumber: '898803',
  },
  {
    productCode: 'CU82-S0H6-5-1',
    batchNumber: 'CU82-S0H6-5-1-2504-00047',
    productionPlanNumber: 'VMFG-PP-2526-00047',
    batchIssuedDate: '23-04-2025',
    issuedBy: 'Viraj',
    month: 'Apr-25',
    qty: 4008,
    sampleQty: 0,
    plugType: 'Indian',
    domestic: 'Domestic',
    export: 'Nil',
    assemblyLine: '',
    batchCompletionDate: '23-04-2025',
    producedQty: 3996,
    startSerialNumber: '898804',
    endSerialNumber: '902811',
  },
  {
    productCode: 'CU82-S0H6-5-1',
    batchNumber: 'CU82-S0H6-5-1-2504-00050',
    productionPlanNumber: 'VMFG-PP-2526-00050',
    batchIssuedDate: '24-04-2025',
    issuedBy: 'Viraj',
    month: 'Apr-25',
    qty: 2000,
    sampleQty: 0,
    plugType: 'American',
    domestic: '',
    export: 'Export',
    assemblyLine: '',
    batchCompletionDate: '30-04-2025',
    producedQty: 2000,
    startSerialNumber: '1',
    endSerialNumber: '2000',
  },
  {
    productCode: 'CU82-S0H6-5-1',
    batchNumber: 'CU82-S0H6-5-1-2504-00056',
    productionPlanNumber: 'VMFG-PP-2526-00056',
    batchIssuedDate: '27-04-2025',
    issuedBy: 'Viraj',
    month: 'Apr-25',
    qty: 2120,
    sampleQty: 0,
    plugType: 'American',
    domestic: '',
    export: 'Export',
    assemblyLine: '',
    batchCompletionDate: '30-04-2025',
    producedQty: 2120,
    startSerialNumber: '2001',
    endSerialNumber: '4120',
  },
  {
    productCode: 'CU82-S0H6-5-1',
    batchNumber: 'CU82-S0H6-5-1-2504-00059',
    productionPlanNumber: 'VMFG-PP-2526-00059',
    batchIssuedDate: '29-04-2025',
    issuedBy: 'ANKIT',
    month: 'Apr-25',
    qty: 2000,
    sampleQty: 0,
    plugType: 'American',
    domestic: '',
    export: 'Export',
    assemblyLine: '',
    batchCompletionDate: '01-05-2025',
    producedQty: 2000,
    startSerialNumber: '4121',
    endSerialNumber: '6120',
  },
  {
    productCode: 'CU82-S0H6-5-2',
    batchNumber: 'CU82-S0H6-5-2-2504-00060',
    productionPlanNumber: 'VMFG-PP-2526-00060',
    batchIssuedDate: '29-04-2025',
    issuedBy: 'ANKIT',
    month: 'Apr-25',
    qty: 2000,
    sampleQty: 0,
    plugType: 'American',
    domestic: '',
    export: 'Export',
    assemblyLine: '',
    batchCompletionDate: '01-05-2025',
    producedQty: 2000,
    startSerialNumber: '6121',
    endSerialNumber: '8120',
  },
  {
    productCode: 'CU82-S0H6-5-2',
    batchNumber: 'CU82-S0H6-5-2-2504-00063',
    productionPlanNumber: 'VMFG-PP-2526-00063',
    batchIssuedDate: '30-04-2025',
    issuedBy: 'ANKIT',
    month: 'Apr-25',
    qty: 2120,
    sampleQty: 0,
    plugType: 'American',
    domestic: '',
    export: 'Export',
    assemblyLine: '',
    batchCompletionDate: '02-05-2025',
    producedQty: 2120,
    startSerialNumber: '2121',
    endSerialNumber: '4120',
  },
  {
    productCode: 'CU82-S0H6-5-2',
    batchNumber: 'CU82-S0H6-5-2-2505-00066',
    productionPlanNumber: 'VMFG-PP-2526-00066',
    batchIssuedDate: '01-05-2025',
    issuedBy: 'Viraj',
    month: 'May-25',
    qty: 4000,
    sampleQty: 0,
    plugType: 'American',
    domestic: '',
    export: 'Export',
    assemblyLine: '',
    batchCompletionDate: '02-05-2025',
    producedQty: 4000,
    startSerialNumber: '6121',
    endSerialNumber: '8120',
  },
  {
    productCode: 'S0H6-1',
    batchNumber: 'S0H6-1-2505-00068',
    productionPlanNumber: 'VMFG-PP-2526-00068',
    batchIssuedDate: '02-05-2025',
    issuedBy: 'Viraj',
    month: 'May-25',
    qty: 2004,
    sampleQty: 0,
    plugType: 'Indian',
    domestic: 'Domestic',
    export: 'Nil',
    assemblyLine: '',
    batchCompletionDate: '04-05-2025',
    producedQty: 2004,
    startSerialNumber: '902812',
    endSerialNumber: '904815',
  },
  {
    productCode: 'S0H6-1',
    batchNumber: 'S0H6-1-2505-00074',
    productionPlanNumber: 'VMFG-PP-2526-00074',
    batchIssuedDate: '03-05-2025',
    issuedBy: 'Viraj',
    month: 'May-25',
    qty: 2004,
    sampleQty: 0,
    plugType: 'Indian',
    domestic: 'Domestic',
    export: 'Nil',
    assemblyLine: '',
    batchCompletionDate: '06-05-2025',
    producedQty: 2004,
    startSerialNumber: '904816',
    endSerialNumber: '906619',
  },
]

/** Same DD-MM-YYYY style as the manifest's own dates, staggered a few days after batch
 *  completion — kept in 2025 so scan dates stay consistent with the manifest's timeline. */
function manifestScanDate(completionDate: string, offsetDays: number): string {
  const [day, month, year] = completionDate.split('-').map(Number)
  const base = new Date(year!, month! - 1, day!)
  base.setDate(base.getDate() + offsetDays)
  return `${pad(base.getDate())}-${pad(base.getMonth() + 1)}-${base.getFullYear()}`
}

/** Fabricates realistic dealer/chemist scan activity for a manifest batch, using serials
 *  drawn from that batch's own produced range so they line up with its Start/End Serial. */
function buildManifestScanHistory(
  row: BmrManifestRow,
  index: number,
  batchId: string,
): BatchScanEntry[] {
  const startSerial = Number(row.startSerialNumber)
  if (!Number.isFinite(startSerial) || row.producedQty <= 0) return []

  const scanCount = Math.min(seededNumber(index + 1, 3, 7), row.producedQty)

  return Array.from({ length: scanCount }).map((_, i) => {
    const seed = index * 31 + i + 1
    const serial = startSerial + seededNumber(seed, 0, row.producedQty)
    const dealer = mockDealers[seed % mockDealers.length]!
    const chemist = mockChemists[seed % mockChemists.length]!
    const isChemistScanned = seed % 3 !== 0

    return {
      id: `${batchId}-scan-${i}`,
      scanSerialNumber: `SN-${serial}`,
      productName: 'S0H6 Handyneb Classic Nebulizer',
      chemistName: isChemistScanned ? chemist.shopName : '—',
      chemistScanDate: isChemistScanned
        ? manifestScanDate(row.batchCompletionDate, 3 + (i % 5))
        : '—',
      dealerName: dealer.shopName,
      dealerScanDate: manifestScanDate(row.batchCompletionDate, 1 + (i % 3)),
    }
  })
}

function buildBatchFromManifestRow(
  row: BmrManifestRow,
  index: number,
): FactoryBatch {
  const id = `bmr-manifest-${index}`
  const scanHistory = buildManifestScanHistory(row, index, id)
  const assignedToDealers = scanHistory.filter(
    (s) => s.dealerName !== '—',
  ).length
  const assignedToChemists = scanHistory.filter(
    (s) => s.chemistName !== '—',
  ).length

  return {
    id,
    batchName: row.batchNumber,
    batchNumber: row.batchNumber,
    batchDate: row.batchIssuedDate,
    quantity: row.qty,
    startSerialNumber: row.startSerialNumber,
    endSerialNumber: row.endSerialNumber,
    masterStartNumber: '—',
    masterEndNumber: '—',
    totalContainers: 0,
    totalProducts: row.producedQty,

    uploadId: `S0H6 Handyneb Classic Nebulizer Manifest`,
    productionPlanNumber: row.productionPlanNumber,
    productName: 'S0H6 Handyneb Classic Nebulizer',
    productCode: row.productCode,
    batchCompletionDate: row.batchCompletionDate,
    assemblyLine: row.assemblyLine,
    exportType: row.export || row.domestic,
    plugType: row.plugType,
    issuedBy: row.issuedBy,
    month: row.month,
    retentionSampleQuantity: row.sampleQty,
    remarks:
      'Imported from BMR upload (S0H6 Handyneb Classic Nebulizer Manifest).',

    isBmrSourced: true,
    domestic: row.domestic,
    export: row.export,

    totalAccepted: row.producedQty,
    totalRejected: 0,

    barcodeRangeStart: '—',
    barcodeRangeEnd: '—',
    processingSummary: `${row.producedQty.toLocaleString('en-IN')} produced out of ${row.qty.toLocaleString('en-IN')} planned.`,
    acceptedProducts: row.producedQty,
    rejectedProducts: 0,
    pendingProducts: 0,

    totalAssignedToDealers: assignedToDealers,
    totalAssignedToChemists: assignedToChemists,
    totalScanned: assignedToChemists,
    totalPendingAllocation: row.producedQty - assignedToDealers,
    duplicateScanAttempts: 0,
    totalRewardsIssued: assignedToChemists,

    hasRedemption: false,

    containers: [],
    scanHistory,
    auditHistory: [
      {
        id: `${id}-audit-0`,
        date: row.batchIssuedDate,
        action: 'Batch Uploaded',
        performedBy: row.issuedBy,
        remarks: 'Manifest validated and imported.',
      },
    ],
    timeline: [
      {
        id: `${id}-tl-0`,
        activity: 'Factory Production',
        dateTime: row.batchIssuedDate,
      },
      {
        id: `${id}-tl-1`,
        activity: 'Batch Created',
        dateTime: row.batchCompletionDate,
      },
    ],
  }
}

export const mockFactoryBatches: FactoryBatch[] = bmrManifestRows.map(
  (row, index) => buildBatchFromManifestRow(row, index),
)

export function getBatchById(id: string): FactoryBatch | undefined {
  return mockFactoryBatches.find((batch) => batch.id === id)
}

export function getContainerById(
  batchId: string,
  containerId: string,
): BatchContainer | undefined {
  return getBatchById(batchId)?.containers.find(
    (container) => container.id === containerId,
  )
}

export function getBoxById(
  batchId: string,
  containerId: string,
  boxId: string,
): ContainerBox | undefined {
  return getContainerById(batchId, containerId)?.boxes.find(
    (box) => box.id === boxId,
  )
}

export function addFactoryBatch(batch: FactoryBatch): void {
  mockFactoryBatches.unshift(batch)
}

/**
 * Builds a FactoryBatch directly from an uploaded BMR row's real values — no fabricated
 * boxes/scan history, since a BMR doesn't contain that data (see isBmrSourced).
 * totalContainers comes from the distinct Master Carton Numbers linked to this batch's
 * UIDs in the uploaded carton linkage file (0 if none were linked).
 */
export function buildFactoryBatchFromBmrRow(
  row: BmrBatchRow,
  uploadFileName: string,
  totalContainers = 0,
): FactoryBatch {
  const id = `bmr-batch-${row.id}-${Date.now()}`

  return {
    id,
    batchName: row.batchNumber,
    batchNumber: row.batchNumber,
    batchDate: row.batchIssuedDate,
    quantity: row.producedQty,
    startSerialNumber: row.startSerialNumber,
    endSerialNumber: row.endSerialNumber,
    masterStartNumber: '—',
    masterEndNumber: '—',
    totalContainers,
    totalProducts: row.producedQty,

    uploadId: uploadFileName,
    productionPlanNumber: row.productionPlanNumber,
    productName: row.productCode,
    productCode: row.productCode,
    batchCompletionDate: row.batchCompletedDate,
    assemblyLine: row.assyLineNo,
    exportType: row.export || row.domestic,
    plugType: row.plugType,
    issuedBy: row.batchIssuedByName,
    month: row.month,
    retentionSampleQuantity: row.sampleQty,
    remarks: `Imported from BMR upload (${uploadFileName}).`,

    isBmrSourced: true,
    domestic: row.domestic,
    export: row.export,

    totalAccepted: row.producedQty,
    totalRejected: 0,

    barcodeRangeStart: '—',
    barcodeRangeEnd: '—',
    processingSummary: `${row.producedQty.toLocaleString('en-IN')} produced out of ${row.qty.toLocaleString('en-IN')} planned.`,
    acceptedProducts: row.producedQty,
    rejectedProducts: 0,
    pendingProducts: 0,

    totalAssignedToDealers: 0,
    totalAssignedToChemists: 0,
    totalScanned: 0,
    totalPendingAllocation: row.producedQty,
    duplicateScanAttempts: 0,
    totalRewardsIssued: 0,

    hasRedemption: false,

    containers: [],
    scanHistory: [],
    auditHistory: [
      {
        id: `${id}-audit-0`,
        date: row.batchIssuedDate,
        action: 'BMR Uploaded',
        performedBy: row.batchIssuedByName || 'System',
        remarks: `Imported from ${uploadFileName}.`,
      },
    ],
    timeline: [
      {
        id: `${id}-tl-0`,
        activity: 'Factory Production',
        dateTime: row.batchIssuedDate,
      },
      {
        id: `${id}-tl-1`,
        activity: 'Batch Created',
        dateTime: row.batchCompletedDate || row.batchIssuedDate,
      },
    ],
  }
}

export const factoryUploadKpis = {
  totalBatches: mockFactoryBatches.length,
  totalContainers: mockFactoryBatches.reduce(
    (sum, b) => sum + b.totalContainers,
    0,
  ),
  totalProducts: mockFactoryBatches.reduce(
    (sum, b) => sum + b.totalProducts,
    0,
  ),
  totalAccepted: mockFactoryBatches.reduce(
    (sum, b) => sum + b.totalAccepted,
    0,
  ),
  totalRejected: mockFactoryBatches.reduce(
    (sum, b) => sum + b.totalRejected,
    0,
  ),
}
