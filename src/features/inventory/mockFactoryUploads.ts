import type {
  AllocationStatus,
  BatchAuditEntry,
  BatchContainer,
  BatchTimelineEntry,
  BoxProduct,
  ContainerBox,
  FactoryBatch,
  ProductTraceabilityStatus,
  ScanStatus,
} from '@/types/factoryUpload'
import { mockDealers } from '@/features/dealers/mockDealers'
import { mockChemists } from '@/features/chemists/mockChemists'
import { mrs } from '@/features/partners/mockPartnerData'

const productNames = ['CardioCare 10mg', 'NeuroPlus 500mg', 'ImmunoBoost Syrup', 'GlucoBalance', 'PainRelief Gel']
const assemblyLines = ['Line A', 'Line B', 'Line C']
const exportTypes = ['Domestic', 'Export']
const plugTypes = ['Type C', 'Type D', 'Type G']
const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026']

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

function buildProduct(seed: number, containerNumber: string, boxNumber: string, serial: number): BoxProduct {
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
  const isChemistAssigned = traceabilityStatus === 'chemist_assigned' || traceabilityStatus === 'scanned' || traceabilityStatus === 'redeemed'
  const isScanned = traceabilityStatus === 'scanned' || traceabilityStatus === 'redeemed'

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
    chemistAllocationDate: isChemistAssigned ? dateFromSeed(seed + 2, 'Jul') : '—',
    currentHolder: isChemistAssigned ? chemist.shopName : isDealerAssigned ? dealer.shopName : 'Factory',

    currentStatus: traceabilityStatus.replace('_', ' '),
    scanStatus,
    rewardPoints,
    lastScanDate: isScanned ? dateFromSeed(seed + 4, 'Jul') : '—',

    scanDate: isScanned ? dateFromSeed(seed + 4, 'Jul') : '—',
    scanTime: isScanned ? `${pad(seededNumber(seed, 8, 20))}:${pad(seededNumber(seed + 1, 0, 59))}` : '—',
    scanBy: isScanned ? chemist.shopName : '—',
    scanLocation: isScanned ? `${chemist.city}, ${chemist.zone} Zone` : '—',
    geoFenceStatus: isScanned ? (seed % 13 === 0 ? 'Outside Fence' : 'Within Fence') : '—',
    scanResult: isScanned ? (scanStatus === 'duplicate_attempt' ? 'Duplicate' : 'Valid') : '—',
    rewardPointsEarned: isScanned ? rewardPoints : 0,

    dealerRewardPoints: isDealerAssigned ? seededNumber(seed, 5, 25) : 0,
    chemistRewardPoints: isChemistAssigned ? seededNumber(seed + 1, 5, 30) : 0,
    rewardScheme: isScanned ? 'Standard Scan Reward' : '—',
    walletTransactionId: isScanned ? `WTX-${100000 + seed * 7}` : '—',
    redemptionStatus: traceabilityStatus === 'redeemed' ? 'Redeemed' : isScanned ? 'Not Redeemed' : '—',

    traceabilityStatus,
  }
}

function buildBox(seed: number, containerNumber: string, boxIndex: number): ContainerBox {
  const boxNumber = `MCB-${pad(boxIndex + 1, 3)}`
  const productCount = seededNumber(seed, 8, 16)
  const products = Array.from({ length: productCount }).map((_, i) =>
    buildProduct(seed * 31 + i, containerNumber, boxNumber, boxIndex * 100 + i + 1),
  )
  const allScanned = products.every((p) => p.traceabilityStatus === 'scanned' || p.traceabilityStatus === 'redeemed')

  return {
    id: `${containerNumber}-${boxNumber}`,
    boxNumber,
    productCount: products.length,
    status: allScanned ? 'Fully Scanned' : 'In Progress',
    products,
  }
}

function buildContainer(seed: number, batchNumber: string, containerIndex: number): BatchContainer {
  const containerNumber = `PI-2026-${pad(seed % 900 + 100, 3)}`
  const boxCount = seededNumber(seed, 2, 5)
  const boxes = Array.from({ length: boxCount }).map((_, i) => buildBox(seed * 17 + i, containerNumber, i))
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

function buildAuditHistory(seed: number, batchId: string): BatchAuditEntry[] {
  const reviewer = mrs[seed % mrs.length]!
  return [
    { id: `${batchId}-audit-0`, date: dateFromSeed(seed, 'Jun'), action: 'Batch Uploaded', performedBy: reviewer, remarks: 'Manifest validated and imported.' },
    { id: `${batchId}-audit-1`, date: dateFromSeed(seed + 2, 'Jun'), action: 'Containers Packed', performedBy: reviewer, remarks: 'All containers confirmed packed.' },
  ]
}

function buildTimeline(seed: number, batchId: string, hasRedemption: boolean): BatchTimelineEntry[] {
  const timeline: BatchTimelineEntry[] = [
    { id: `${batchId}-tl-0`, activity: 'Factory Production', dateTime: dateFromSeed(seed, 'Jun') },
    { id: `${batchId}-tl-1`, activity: 'Batch Created', dateTime: dateFromSeed(seed + 1, 'Jun') },
    { id: `${batchId}-tl-2`, activity: 'Container Packed', dateTime: dateFromSeed(seed + 2, 'Jun') },
    { id: `${batchId}-tl-3`, activity: 'Dealer Allocation', dateTime: dateFromSeed(seed + 3, 'Jul') },
    { id: `${batchId}-tl-4`, activity: 'Chemist Allocation', dateTime: dateFromSeed(seed + 4, 'Jul') },
    { id: `${batchId}-tl-5`, activity: 'Barcode Scanned', dateTime: dateFromSeed(seed + 5, 'Jul') },
    { id: `${batchId}-tl-6`, activity: 'Reward Credited', dateTime: dateFromSeed(seed + 6, 'Jul') },
  ]
  if (hasRedemption) {
    timeline.push({ id: `${batchId}-tl-7`, activity: 'Redeemed', dateTime: dateFromSeed(seed + 7, 'Jul') })
  }
  return timeline
}

function buildBatch(seed: number): FactoryBatch {
  const id = `batch-${seed}`
  const batchNumber = `FU-${100 + seed}`
  const batchName = `Factory Batch ${batchNumber}`
  const containerCount = seededNumber(seed, 2, 4)
  const containers = Array.from({ length: containerCount }).map((_, i) => buildContainer(seed * 53 + i, batchNumber, i))

  const totalProducts = containers.reduce((sum, c) => sum + c.productCount, 0)
  const allProducts = containers.flatMap((c) => c.boxes.flatMap((b) => b.products))

  const accepted = allProducts.filter((p) => p.productStatus !== 'manufactured').length
  const rejected = seededNumber(seed, 0, 4)
  const pending = totalProducts - accepted - rejected

  const assignedToDealers = allProducts.filter((p) => p.allocatedDealer !== '—').length
  const assignedToChemists = allProducts.filter((p) => p.allocatedChemist !== '—').length
  const scanned = allProducts.filter((p) => p.traceabilityStatus === 'scanned' || p.traceabilityStatus === 'redeemed').length
  const pendingAllocation = totalProducts - assignedToDealers
  const duplicateScanAttempts = allProducts.filter((p) => p.scanStatus === 'duplicate_attempt').length
  const rewardsIssued = allProducts.filter((p) => p.rewardPoints > 0).length
  const hasRedemption = allProducts.some((p) => p.traceabilityStatus === 'redeemed')

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
    auditHistory: buildAuditHistory(seed, id),
    timeline: buildTimeline(seed, id, hasRedemption),
  }
}

export const mockFactoryBatches: FactoryBatch[] = Array.from({ length: 18 }).map((_, index) => buildBatch(index + 1))

export function getBatchById(id: string): FactoryBatch | undefined {
  return mockFactoryBatches.find((batch) => batch.id === id)
}

export function getContainerById(batchId: string, containerId: string): BatchContainer | undefined {
  return getBatchById(batchId)?.containers.find((container) => container.id === containerId)
}

export function getBoxById(batchId: string, containerId: string, boxId: string): ContainerBox | undefined {
  return getContainerById(batchId, containerId)?.boxes.find((box) => box.id === boxId)
}

export function addFactoryBatch(batch: FactoryBatch): void {
  mockFactoryBatches.unshift(batch)
}

export function buildNewBatchFromUpload(fileName: string): FactoryBatch {
  const seed = mockFactoryBatches.length + 1 + (fileName.length % 7)
  return buildBatch(1000 + seed)
}

export const factoryUploadKpis = {
  totalBatches: mockFactoryBatches.length,
  totalContainers: mockFactoryBatches.reduce((sum, b) => sum + b.totalContainers, 0),
  totalProducts: mockFactoryBatches.reduce((sum, b) => sum + b.totalProducts, 0),
  totalAccepted: mockFactoryBatches.reduce((sum, b) => sum + b.totalAccepted, 0),
  totalRejected: mockFactoryBatches.reduce((sum, b) => sum + b.totalRejected, 0),
}
