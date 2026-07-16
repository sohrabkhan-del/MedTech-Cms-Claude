import type {
  BatchActiveStatus,
  BatchLifecycleEntry,
  BatchScanStatus,
  BatchUploadHistoryEntry,
  DistributionJourneyEntry,
  FraudDetectionSummary,
  ProductBatch,
  ProductionBatch,
  QrBarcodeInfo,
  QrCodeStatistics,
  RelatedRewardSummary,
  RelatedScheme,
  RewardSummary,
  ScanAnalyticsRow,
  ScanStatistics,
} from '@/types/productBatch'
import { mockFactoryBatches } from '@/features/inventory/mockFactoryUploads'
import { mockProducts } from '@/features/inventory/mockProducts'
import { mockDealers } from '@/features/dealers/mockDealers'
import { mockChemists } from '@/features/chemists/mockChemists'
import { mrs } from '@/features/partners/mockPartnerData'

const distributorNames = ['Apex MedDistribution', 'Sunrise Pharma Logistics', 'National Health Supply Co.', 'Care Plus Distributors']
const schemeNames = ['Festive Bonus Scheme', 'Monsoon Loyalty Drive', 'Quarterly Booster', 'New Year Rewards']
const uploadFileNames = ['factory-manifest-batch.xlsx', 'production-upload.xls', 'batch-import-final.xlsx']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, '0')
}

function dateFromSeed(seed: number, month = 'Jul', year = 2026): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} ${year}`
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

function buildQrBarcodeInfo(seed: number, totalPackages: number): QrBarcodeInfo {
  const totalScanned = seededNumber(seed, 0, totalPackages)
  const duplicateScans = seededNumber(seed + 1, 0, 8)
  return {
    barcodeSeries: `BC-${20260000 + seed * 17}`,
    serialRangeStart: `SN-${pad(1, 6)}`,
    serialRangeEnd: `SN-${pad(totalPackages, 6)}`,
    totalGenerated: totalPackages,
    totalAvailable: totalPackages - totalScanned,
    totalScanned,
    duplicateScans,
  }
}

function buildDistributionJourney(seed: number): DistributionJourneyEntry[] {
  return Array.from({ length: 3 }).map((_, i) => {
    const dealer = mockDealers[(seed + i) % mockDealers.length]!
    const chemist = mockChemists[(seed + i) % mockChemists.length]!
    return {
      id: `dist-${seed}-${i}`,
      distributor: distributorNames[(seed + i) % distributorNames.length]!,
      dealer: dealer.shopName,
      chemist: chemist.shopName,
      purchaseDate: dateFromSeed(seed + i * 2, 'Jul'),
      currentOwner: i % 3 === 2 ? chemist.shopName : dealer.shopName,
    }
  })
}

function buildScanStatistics(seed: number, totalScanned: number): ScanStatistics {
  return {
    totalSuccessfulScans: totalScanned,
    failedScans: seededNumber(seed, 0, 15),
    duplicateScans: seededNumber(seed + 1, 0, 8),
    geoFenceViolations: seededNumber(seed + 2, 0, 5),
  }
}

function buildRewardSummary(seed: number, coinValue: number, totalScanned: number): RewardSummary {
  const bonusCoins = seededNumber(seed, 0, 10)
  return {
    baseCoinValue: coinValue,
    bonusCoins,
    appliedScheme: schemeNames[seed % schemeNames.length]!,
    totalRewardPointsIssued: (coinValue + bonusCoins) * totalScanned,
  }
}

function buildTimeline(seed: number, batchId: string): BatchLifecycleEntry[] {
  return [
    { id: `${batchId}-tl-0`, activity: 'Batch Created', dateTime: dateFromSeed(seed, 'Jun') },
    { id: `${batchId}-tl-1`, activity: 'QR Generated', dateTime: dateFromSeed(seed + 1, 'Jun') },
    { id: `${batchId}-tl-2`, activity: 'Uploaded', dateTime: dateFromSeed(seed + 2, 'Jun') },
    { id: `${batchId}-tl-3`, activity: 'Distributor Assigned', dateTime: dateFromSeed(seed + 3, 'Jul') },
    { id: `${batchId}-tl-4`, activity: 'Dealer Assigned', dateTime: dateFromSeed(seed + 4, 'Jul') },
    { id: `${batchId}-tl-5`, activity: 'Chemist Purchased', dateTime: dateFromSeed(seed + 5, 'Jul') },
    { id: `${batchId}-tl-6`, activity: 'First Scan', dateTime: dateFromSeed(seed + 6, 'Jul') },
    { id: `${batchId}-tl-7`, activity: 'Last Scan', dateTime: dateFromSeed(seed + 7, 'Jul') },
  ]
}

function buildUploadHistory(seed: number, batchId: string, totalPackages: number): BatchUploadHistoryEntry[] {
  const failed = seededNumber(seed, 0, 5)
  return [
    {
      id: `${batchId}-upload-0`,
      uploadFile: uploadFileNames[seed % uploadFileNames.length]!,
      uploadedBy: mrs[seed % mrs.length]!,
      uploadDate: dateFromSeed(seed, 'Jun'),
      totalRecords: totalPackages,
      success: totalPackages - failed,
      failed,
    },
  ]
}

function buildQrCodeStatistics(seed: number, totalPackages: number, totalScanned: number): QrCodeStatistics {
  const activated = Math.min(totalPackages, totalScanned + seededNumber(seed, 0, totalPackages - totalScanned || 1))
  return {
    totalGenerated: totalPackages,
    activated,
    scanned: totalScanned,
    remaining: totalPackages - activated,
  }
}

function buildFraudDetection(seed: number): FraudDetectionSummary {
  return {
    duplicateScanCount: seededNumber(seed, 0, 8),
    invalidBarcodeCount: seededNumber(seed + 1, 0, 5),
    outsideGeoFence: seededNumber(seed + 2, 0, 4),
    suspiciousActivity: seededNumber(seed + 3, 0, 3),
  }
}

function buildRelatedSchemes(seed: number, batchId: string): RelatedScheme[] {
  const statuses: RelatedScheme['status'][] = ['active', 'upcoming', 'expired']
  return Array.from({ length: 2 }).map((_, i) => ({
    id: `${batchId}-scheme-${i}`,
    schemeName: schemeNames[(seed + i) % schemeNames.length]!,
    schemeType: i === 0 ? 'General Scheme' : 'Sessional Scheme',
    status: statuses[(seed + i) % statuses.length]!,
  }))
}

function buildRelatedRewards(seed: number, totalRewardPointsIssued: number): RelatedRewardSummary {
  const dealerRewards = Math.round(totalRewardPointsIssued * 0.55)
  const chemistRewards = totalRewardPointsIssued - dealerRewards
  return {
    totalRewardsGenerated: totalRewardPointsIssued,
    dealerRewards,
    chemistRewards,
    redeemedRewards: seededNumber(seed, 0, totalRewardPointsIssued || 1),
  }
}

function buildProductionBatch(seed: number): ProductionBatch {
  const factoryBatch = mockFactoryBatches[seed % mockFactoryBatches.length]!
  const product = mockProducts[seed % mockProducts.length]!
  const id = `production-batch-${seed}`
  const status = resolveActiveStatus(seed)
  const totalPackages = factoryBatch.totalProducts
  const totalScanned = factoryBatch.totalScanned
  const coinValue = seededNumber(seed, 5, 50)

  const qrBarcodeInfo = buildQrBarcodeInfo(seed, totalPackages)
  const scanStatistics = buildScanStatistics(seed, totalScanned)
  const rewardSummary = buildRewardSummary(seed, coinValue, totalScanned)

  return {
    id,
    batchNo: factoryBatch.batchNumber,
    productCode: product.productCode,
    productName: product.productName,
    productCategory: product.productCategory,
    manufacturingDate: factoryBatch.batchDate,
    expiryDate: dateFromSeed(seed, 'Dec', 2027),
    totalPackages,
    qrBarcodeGenerated: true,
    totalScans: totalScanned,
    coinValue,
    status,

    qrBarcodeInfo,
    distributionJourney: buildDistributionJourney(seed),
    scanStatistics,
    rewardSummary,
    timeline: buildTimeline(seed, id),

    uploadHistory: buildUploadHistory(seed, id, totalPackages),
    qrCodeStatistics: buildQrCodeStatistics(seed, totalPackages, totalScanned),
    fraudDetection: buildFraudDetection(seed),
    relatedSchemes: buildRelatedSchemes(seed, id),
    relatedRewards: buildRelatedRewards(seed, rewardSummary.totalRewardPointsIssued),
  }
}

export const mockProductionBatches: ProductionBatch[] = mockFactoryBatches.map((_, index) => buildProductionBatch(index + 1))

export function getProductionBatchById(id: string): ProductionBatch | undefined {
  return mockProductionBatches.find((batch) => batch.id === id)
}

export const productionBatchKpis = {
  totalBatches: mockProductionBatches.length,
  activeBatches: mockProductionBatches.filter((b) => b.status === 'active').length,
  expiredBatches: mockProductionBatches.filter((b) => b.status === 'expired').length,
  totalScans: mockProductionBatches.reduce((sum, b) => sum + b.totalScans, 0),
}

export const scanAnalyticsRows: ScanAnalyticsRow[] = mockProductionBatches.map((batch) => ({
  batchNumber: batch.batchNo,
  product: batch.productName,
  successfulScans: batch.scanStatistics.totalSuccessfulScans,
  failedScans: batch.scanStatistics.failedScans,
  duplicateScans: batch.scanStatistics.duplicateScans,
  pendingScans: Math.max(batch.totalPackages - batch.scanStatistics.totalSuccessfulScans, 0),
  rewardPointsIssued: batch.rewardSummary.totalRewardPointsIssued,
}))
