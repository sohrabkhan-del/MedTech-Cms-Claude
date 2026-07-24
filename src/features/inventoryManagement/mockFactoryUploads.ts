import type {
  AllocationStatus,
  BatchAuditEntry,
  BatchContainer,
  BatchScanEntry,
  BatchTimelineEntry,
  BoxProduct,
  ContainerBox,
  FactoryBatch,
  ProductTraceabilityStatus,
  ScanStatus,
} from '@/types/factoryUpload'
import type { BmrBatchRow } from '@/types/batchUidUpload'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mrs } from '@/features/userManagement/mockPartnerData'

const productNames = [
  'CardioCare 10mg',
  'NeuroPlus 500mg',
  'ImmunoBoost Syrup',
  'GlucoBalance',
  'PainRelief Gel',
]
const assemblyLines = ['Line A', 'Line B', 'Line C']
const exportTypes = ['Domestic', 'Export']
const plugTypes = ['Type C', 'Type D', 'Type G']
const months = [
  'Jan 2026',
  'Feb 2026',
  'Mar 2026',
  'Apr 2026',
  'May 2026',
  'Jun 2026',
  'Jul 2026',
]

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, '0')
}

function dateFromSeed(seed: number, month = 'Jul'): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} 2026`
}

function buildProduct(
  seed: number,
  containerNumber: string,
  boxNumber: string,
  serial: number,
): BoxProduct {
  const id = `product-${seed}-${serial}`
  const dealer = mockDealers[seed % mockDealers.length]!
  const chemist = mockChemists[seed % mockChemists.length]!

  const statusRoll = seed % 10
  let traceabilityStatus: ProductTraceabilityStatus
  let scanStatus: ScanStatus
  let allocationStatus: AllocationStatus

  if (statusRoll < 1) {
    traceabilityStatus = 'manufactured'
    scanStatus = 'not_scanned'
    allocationStatus = 'pending'
  } else if (statusRoll < 3) {
    traceabilityStatus = 'dealer_assigned'
    scanStatus = 'not_scanned'
    allocationStatus = 'allocated'
  } else if (statusRoll < 5) {
    traceabilityStatus = 'chemist_assigned'
    scanStatus = 'not_scanned'
    allocationStatus = 'allocated'
  } else if (statusRoll < 9) {
    traceabilityStatus = 'scanned'
    scanStatus = seed % 23 === 0 ? 'duplicate_attempt' : 'scanned'
    allocationStatus = 'allocated'
  } else {
    traceabilityStatus = 'redeemed'
    scanStatus = 'scanned'
    allocationStatus = 'allocated'
  }

  const isDealerAssigned = traceabilityStatus !== 'manufactured'
  const isChemistAssigned =
    traceabilityStatus === 'chemist_assigned' ||
    traceabilityStatus === 'scanned' ||
    traceabilityStatus === 'redeemed'
  const isScanned =
    traceabilityStatus === 'scanned' || traceabilityStatus === 'redeemed'

  const rewardPoints = isScanned ? seededNumber(seed, 10, 60) : 0

  return {
    id,
    serialNumber: `SN-${pad(serial, 6)}`,
    barcodeNumber: `${containerNumber}-${boxNumber}-${pad(serial, 4)}`,
    productStatus: traceabilityStatus,

    allocatedDealer: isDealerAssigned ? dealer.shopName : '—',
    dealerCode: isDealerAssigned ? dealer.id : '—',
    dealerAllocationDate: isDealerAssigned ? dateFromSeed(seed, 'Jul') : '—',
    dealerAllocationStatus: allocationStatus,

    allocatedChemist: isChemistAssigned ? chemist.shopName : '—',
    chemistCode: isChemistAssigned ? chemist.id : '—',
    chemistAllocationDate: isChemistAssigned
      ? dateFromSeed(seed + 2, 'Jul')
      : '—',
    currentHolder: isChemistAssigned
      ? chemist.shopName
      : isDealerAssigned
        ? dealer.shopName
        : 'Factory',

    currentStatus: traceabilityStatus.replace('_', ' '),
    scanStatus,
    rewardPoints,
    lastScanDate: isScanned ? dateFromSeed(seed + 4, 'Jul') : '—',

    scanDate: isScanned ? dateFromSeed(seed + 4, 'Jul') : '—',
    scanTime: isScanned
      ? `${pad(seededNumber(seed, 8, 20))}:${pad(seededNumber(seed + 1, 0, 59))}`
      : '—',
    scanBy: isScanned ? chemist.shopName : '—',
    scanLocation: isScanned ? `${chemist.city}, ${chemist.zone} Zone` : '—',
    geoFenceStatus: isScanned
      ? seed % 13 === 0
        ? 'Outside Fence'
        : 'Within Fence'
      : '—',
    scanResult: isScanned
      ? scanStatus === 'duplicate_attempt'
        ? 'Duplicate'
        : 'Valid'
      : '—',
    rewardPointsEarned: isScanned ? rewardPoints : 0,

    dealerRewardPoints: isDealerAssigned ? seededNumber(seed, 5, 25) : 0,
    chemistRewardPoints: isChemistAssigned ? seededNumber(seed + 1, 5, 30) : 0,
    rewardScheme: isScanned ? 'Standard Scan Reward' : '—',
    walletTransactionId: isScanned ? `WTX-${100000 + seed * 7}` : '—',
    redemptionStatus:
      traceabilityStatus === 'redeemed'
        ? 'Redeemed'
        : isScanned
          ? 'Not Redeemed'
          : '—',

    traceabilityStatus,
  }
}

function buildBox(
  seed: number,
  containerNumber: string,
  boxIndex: number,
): ContainerBox {
  const boxNumber = `MCB-${pad(boxIndex + 1, 3)}`
  const productCount = seededNumber(seed, 8, 16)
  const products = Array.from({ length: productCount }).map((_, i) =>
    buildProduct(
      seed * 31 + i,
      containerNumber,
      boxNumber,
      boxIndex * 100 + i + 1,
    ),
  )
  const allScanned = products.every(
    (p) =>
      p.traceabilityStatus === 'scanned' || p.traceabilityStatus === 'redeemed',
  )

  return {
    id: `${containerNumber}-${boxNumber}`,
    boxNumber,
    productCount: products.length,
    status: allScanned ? 'Fully Scanned' : 'In Progress',
    products,
  }
}

function buildContainer(
  seed: number,
  batchNumber: string,
  containerIndex: number,
): BatchContainer {
  const containerNumber = `PI-2026-${pad((seed % 900) + 100, 3)}`
  const boxCount = seededNumber(seed, 2, 5)
  const boxes = Array.from({ length: boxCount }).map((_, i) =>
    buildBox(seed * 17 + i, containerNumber, i),
  )
  const productCount = boxes.reduce((sum, b) => sum + b.productCount, 0)

  return {
    id: `${batchNumber}-container-${containerIndex}`,
    containerNumber,
    boxCount: boxes.length,
    productCount,
    status: containerIndex % 5 === 0 ? 'Pending' : 'Packed',
    boxes,
  }
}

function buildScanHistory(
  products: BoxProduct[],
  productName: string,
  batchId: string,
): BatchScanEntry[] {
  return products
    .filter((p) => p.allocatedDealer !== '—' || p.allocatedChemist !== '—')
    .map((p, i) => ({
      id: `${batchId}-scan-${i}`,
      scanSerialNumber: p.serialNumber,
      productName,
      chemistName: p.allocatedChemist !== '—' ? p.allocatedChemist : '—',
      chemistScanDate:
        p.allocatedChemist !== '—' ? p.chemistAllocationDate : '—',
      dealerName: p.allocatedDealer !== '—' ? p.allocatedDealer : '—',
      dealerScanDate: p.allocatedDealer !== '—' ? p.dealerAllocationDate : '—',
    }))
}

function buildAuditHistory(seed: number, batchId: string): BatchAuditEntry[] {
  const reviewer = mrs[seed % mrs.length]!
  return [
    {
      id: `${batchId}-audit-0`,
      date: dateFromSeed(seed, 'Jun'),
      action: 'Batch Uploaded',
      performedBy: reviewer,
      remarks: 'Manifest validated and imported.',
    },
    {
      id: `${batchId}-audit-1`,
      date: dateFromSeed(seed + 2, 'Jun'),
      action: 'Containers Packed',
      performedBy: reviewer,
      remarks: 'All containers confirmed packed.',
    },
  ]
}

function buildTimeline(
  seed: number,
  batchId: string,
  hasRedemption: boolean,
): BatchTimelineEntry[] {
  const timeline: BatchTimelineEntry[] = [
    {
      id: `${batchId}-tl-0`,
      activity: 'Factory Production',
      dateTime: dateFromSeed(seed, 'Jun'),
    },
    {
      id: `${batchId}-tl-1`,
      activity: 'Batch Created',
      dateTime: dateFromSeed(seed + 1, 'Jun'),
    },
    {
      id: `${batchId}-tl-2`,
      activity: 'Container Packed',
      dateTime: dateFromSeed(seed + 2, 'Jun'),
    },
    {
      id: `${batchId}-tl-3`,
      activity: 'Dealer Allocation',
      dateTime: dateFromSeed(seed + 3, 'Jul'),
    },
    {
      id: `${batchId}-tl-4`,
      activity: 'Chemist Allocation',
      dateTime: dateFromSeed(seed + 4, 'Jul'),
    },
    {
      id: `${batchId}-tl-5`,
      activity: 'Barcode Scanned',
      dateTime: dateFromSeed(seed + 5, 'Jul'),
    },
    {
      id: `${batchId}-tl-6`,
      activity: 'Reward Credited',
      dateTime: dateFromSeed(seed + 6, 'Jul'),
    },
  ]
  if (hasRedemption) {
    timeline.push({
      id: `${batchId}-tl-7`,
      activity: 'Redeemed',
      dateTime: dateFromSeed(seed + 7, 'Jul'),
    })
  }
  return timeline
}

function buildBatch(seed: number): FactoryBatch {
  const id = `batch-${seed}`
  const batchNumber = `FU-${100 + seed}`
  const batchName = `Factory Batch ${batchNumber}`
  const containerCount = seededNumber(seed, 2, 4)
  const containers = Array.from({ length: containerCount }).map((_, i) =>
    buildContainer(seed * 53 + i, batchNumber, i),
  )

  const totalProducts = containers.reduce((sum, c) => sum + c.productCount, 0)
  const allProducts = containers.flatMap((c) =>
    c.boxes.flatMap((b) => b.products),
  )

  const accepted = allProducts.filter(
    (p) => p.productStatus !== 'manufactured',
  ).length
  const rejected = seededNumber(seed, 0, 4)
  const pending = totalProducts - accepted - rejected

  const assignedToDealers = allProducts.filter(
    (p) => p.allocatedDealer !== '—',
  ).length
  const assignedToChemists = allProducts.filter(
    (p) => p.allocatedChemist !== '—',
  ).length
  const scanned = allProducts.filter(
    (p) =>
      p.traceabilityStatus === 'scanned' || p.traceabilityStatus === 'redeemed',
  ).length
  const pendingAllocation = totalProducts - assignedToDealers
  const duplicateScanAttempts = allProducts.filter(
    (p) => p.scanStatus === 'duplicate_attempt',
  ).length
  const rewardsIssued = allProducts.filter((p) => p.rewardPoints > 0).length
  const hasRedemption = allProducts.some(
    (p) => p.traceabilityStatus === 'redeemed',
  )

  const startSerial = 1
  const endSerial = totalProducts

  return {
    id,
    batchName,
    batchNumber,
    batchDate: dateFromSeed(seed, 'Jun'),
    quantity: totalProducts,
    startSerialNumber: `SN-${pad(startSerial, 6)}`,
    endSerialNumber: `SN-${pad(endSerial, 6)}`,
    masterStartNumber: `MST-${pad(seed * 1000 + 1, 7)}`,
    masterEndNumber: `MST-${pad(seed * 1000 + totalProducts, 7)}`,
    totalContainers: containers.length,
    totalProducts,

    uploadId: `UPL-${20260000 + seed * 9}`,
    productionPlanNumber: `PP-${2026000 + seed * 5}`,
    productName: productNames[seed % productNames.length]!,
    productCode: `PC-${20260000 + seed * 11}`,
    batchCompletionDate: dateFromSeed(seed + 5, 'Jun'),
    assemblyLine: assemblyLines[seed % assemblyLines.length]!,
    exportType: exportTypes[seed % exportTypes.length]!,
    plugType: plugTypes[seed % plugTypes.length]!,
    issuedBy: mrs[seed % mrs.length]!,
    month: months[seed % months.length]!,
    retentionSampleQuantity: seededNumber(seed, 5, 25),
    remarks: 'Batch imported via factory manifest upload.',

    totalAccepted: accepted,
    totalRejected: rejected,

    barcodeRangeStart: `${containers[0]?.containerNumber ?? 'PI-2026-000'}-MCB-001-0001`,
    barcodeRangeEnd: `${containers[containers.length - 1]?.containerNumber ?? 'PI-2026-000'}-MCB-${pad(containers[containers.length - 1]?.boxCount ?? 1, 3)}-${pad(99, 4)}`,
    processingSummary: `${accepted} accepted, ${rejected} rejected, ${pending} pending out of ${totalProducts} total.`,
    acceptedProducts: accepted,
    rejectedProducts: rejected,
    pendingProducts: pending,

    totalAssignedToDealers: assignedToDealers,
    totalAssignedToChemists: assignedToChemists,
    totalScanned: scanned,
    totalPendingAllocation: pendingAllocation,
    duplicateScanAttempts,
    totalRewardsIssued: rewardsIssued,

    hasRedemption,

    containers,
    scanHistory: buildScanHistory(
      allProducts,
      productNames[seed % productNames.length]!,
      id,
    ),
    auditHistory: buildAuditHistory(seed, id),
    timeline: buildTimeline(seed, id, hasRedemption),
  }
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

function buildBatchFromManifestRow(row: BmrManifestRow, index: number): FactoryBatch {
  const id = `bmr-manifest-${index}`
  const scanHistory = buildManifestScanHistory(row, index, id)
  const assignedToDealers = scanHistory.filter((s) => s.dealerName !== '—').length
  const assignedToChemists = scanHistory.filter((s) => s.chemistName !== '—').length

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
    remarks: 'Imported from BMR upload (S0H6 Handyneb Classic Nebulizer Manifest).',

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

export const mockFactoryBatches: FactoryBatch[] = bmrManifestRows.map((row, index) =>
  buildBatchFromManifestRow(row, index),
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

/** Used by the Manifest File + Supporting File form (FactoryUploadFormPage), which has no
 *  real batch data to work with — still fabricates a mock batch. */
export function buildNewBatchFromUpload(fileName: string): FactoryBatch {
  const seed = mockFactoryBatches.length + 1 + (fileName.length % 7)
  return buildBatch(1000 + seed)
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
