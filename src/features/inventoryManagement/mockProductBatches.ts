import type {
  BatchActiveStatus,
  BatchScanStatus,
  ProductBatch,
  ProductionBatch,
  QrBarcodeInfo,
  ScanAnalyticsRow,
} from '@/types/productBatch'
import type { MappedBatch } from '@/types/batchUidUpload'
import { mockFactoryBatches } from '@/features/inventoryManagement/mockFactoryUploads'
import { mockProducts } from '@/features/inventoryManagement/mockProducts'

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function resolveScanStatus(seed: number, totalScanned: number): BatchScanStatus {
  if (totalScanned === 0) return 'not_started'
  return seed % 4 === 0 ? 'completed' : 'in_progress'
}

function resolveActiveStatus(seed: number): BatchActiveStatus {
  if (seed % 11 === 0) return 'expired'
  if (seed % 9 === 0) return 'inactive'
  return 'active'
}

function buildProductBatch(seed: number): ProductBatch {
  const factoryBatch = mockFactoryBatches[seed % mockFactoryBatches.length]!
  const product = mockProducts[seed % mockProducts.length]!

  return {
    id: `product-batch-${seed}`,
    productCode: product.productCode,
    productName: product.productName,
    category: product.productCategory,
    batchNo: factoryBatch.batchNumber,
    serialRangeStart: factoryBatch.startSerialNumber,
    serialRangeEnd: factoryBatch.endSerialNumber,
    coinValue: seededNumber(seed, 5, 50),
    scanStatus: resolveScanStatus(seed, factoryBatch.totalScanned),
    totalScans: factoryBatch.totalScanned,
    activeStatus: resolveActiveStatus(seed),
  }
}

export const mockProductBatches: ProductBatch[] = mockFactoryBatches.map((_, index) => buildProductBatch(index + 1))

export function getProductBatchById(id: string): ProductBatch | undefined {
  return mockProductBatches.find((batch) => batch.id === id)
}

export const productBatchKpis = {
  totalBatches: mockProductBatches.length,
  activeBatches: mockProductBatches.filter((b) => b.activeStatus === 'active').length,
  totalScans: mockProductBatches.reduce((sum, b) => sum + b.totalScans, 0),
  scanCompleted: mockProductBatches.filter((b) => b.scanStatus === 'completed').length,
}

// --- Full production batch model ---

// Product Batches listing starts empty — rows only appear once a Batch & UID Upload
// has been completed in this session, via addProductionBatches. (No seeded mock rows;
// mockFactoryBatches above is still used to derive uploaded batches' product/category data.)
let uploadedProductionBatches: ProductionBatch[] = []

export function getMockProductionBatches(): ProductionBatch[] {
  return uploadedProductionBatches
}

export function addProductionBatches(batches: ProductionBatch[]): void {
  uploadedProductionBatches = [...batches, ...uploadedProductionBatches]
}

export function getProductionBatchById(id: string): ProductionBatch | undefined {
  return uploadedProductionBatches.find((batch) => batch.id === id)
}

export function getProductionBatchKpis() {
  return {
    totalBatches: uploadedProductionBatches.length,
    activeBatches: uploadedProductionBatches.filter((b) => b.status === 'active').length,
    expiredBatches: uploadedProductionBatches.filter((b) => b.status === 'expired').length,
    totalScans: uploadedProductionBatches.reduce((sum, b) => sum + b.totalScans, 0),
  }
}

/** Builds a freshly-imported ProductionBatch (zero scans/journey yet) from a Batch & UID Upload result. */
export function buildProductionBatchFromUpload(mappedBatch: MappedBatch, uploadFileName: string): ProductionBatch {
  const product = mockProducts.find((p) => p.productCode === mappedBatch.productCode)
  const today = new Date().toISOString().slice(0, 10)
  const id = `production-batch-upload-${mappedBatch.id}-${Date.now()}`

  const qrBarcodeInfo: QrBarcodeInfo = {
    barcodeSeries: `BC-${mappedBatch.batchNumber}`,
    serialRangeStart: mappedBatch.startSerialNumber,
    serialRangeEnd: mappedBatch.endSerialNumber,
    totalGenerated: mappedBatch.uidCount,
    totalAvailable: mappedBatch.uidCount,
    totalScanned: 0,
    duplicateScans: 0,
  }

  return {
    id,
    batchNo: mappedBatch.batchNumber,
    productCode: mappedBatch.productCode,
    productName: product?.productName ?? mappedBatch.productCode,
    productCategory: product?.productCategory ?? 'Uncategorized',
    manufacturingDate: today,
    expiryDate: today,
    totalPackages: mappedBatch.producedQty,
    qrBarcodeGenerated: true,
    totalScans: 0,
    coinValue: 0,
    status: 'active',

    qrBarcodeInfo,
    distributionJourney: [],
    scanStatistics: { totalSuccessfulScans: 0, failedScans: 0, duplicateScans: 0, geoFenceViolations: 0 },
    rewardSummary: { baseCoinValue: 0, bonusCoins: 0, appliedScheme: '—', totalRewardPointsIssued: 0 },
    timeline: [{ id: `${id}-tl-0`, activity: 'Uploaded', dateTime: today }],

    uploadHistory: [
      {
        id: `${id}-upload-0`,
        uploadFile: uploadFileName,
        uploadedBy: 'You',
        uploadDate: today,
        totalRecords: mappedBatch.producedQty,
        success: mappedBatch.producedQty,
        failed: 0,
      },
    ],
    qrCodeStatistics: { totalGenerated: mappedBatch.uidCount, activated: 0, scanned: 0, remaining: mappedBatch.uidCount },
    fraudDetection: { duplicateScanCount: 0, invalidBarcodeCount: 0, outsideGeoFence: 0, suspiciousActivity: 0 },
    relatedSchemes: [],
    relatedRewards: { totalRewardsGenerated: 0, dealerRewards: 0, chemistRewards: 0, redeemedRewards: 0 },
  }
}

export function getScanAnalyticsRows(): ScanAnalyticsRow[] {
  return uploadedProductionBatches.map((batch) => ({
    batchNumber: batch.batchNo,
    product: batch.productName,
    successfulScans: batch.scanStatistics.totalSuccessfulScans,
    failedScans: batch.scanStatistics.failedScans,
    duplicateScans: batch.scanStatistics.duplicateScans,
    pendingScans: Math.max(batch.totalPackages - batch.scanStatistics.totalSuccessfulScans, 0),
    rewardPointsIssued: batch.rewardSummary.totalRewardPointsIssued,
  }))
}
