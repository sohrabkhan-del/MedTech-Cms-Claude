export type BatchScanStatus = 'not_started' | 'in_progress' | 'completed'
export type BatchActiveStatus = 'active' | 'inactive' | 'expired'

export interface ProductBatch {
  id: string
  productCode: string
  productName: string
  category: string
  batchNo: string
  serialRangeStart: string
  serialRangeEnd: string
  coinValue: number
  scanStatus: BatchScanStatus
  totalScans: number
  activeStatus: BatchActiveStatus
}

// --- Full production batch model (Product Batches module) ---

export interface QrBarcodeInfo {
  barcodeSeries: string
  serialRangeStart: string
  serialRangeEnd: string
  totalGenerated: number
  totalAvailable: number
  totalScanned: number
  duplicateScans: number
}

export interface DistributionJourneyEntry {
  id: string
  distributor: string
  dealer: string
  chemist: string
  purchaseDate: string
  currentOwner: string
}

export interface ScanStatistics {
  totalSuccessfulScans: number
  failedScans: number
  duplicateScans: number
  geoFenceViolations: number
}

export interface RewardSummary {
  baseCoinValue: number
  bonusCoins: number
  appliedScheme: string
  totalRewardPointsIssued: number
}

export type BatchLifecycleActivity =
  | 'Batch Created'
  | 'QR Generated'
  | 'Uploaded'
  | 'Distributor Assigned'
  | 'Dealer Assigned'
  | 'Chemist Purchased'
  | 'First Scan'
  | 'Last Scan'

export interface BatchLifecycleEntry {
  id: string
  activity: BatchLifecycleActivity
  dateTime: string
}

export interface BatchUploadHistoryEntry {
  id: string
  uploadFile: string
  uploadedBy: string
  uploadDate: string
  totalRecords: number
  success: number
  failed: number
}

export interface QrCodeStatistics {
  totalGenerated: number
  activated: number
  scanned: number
  remaining: number
}

export interface FraudDetectionSummary {
  duplicateScanCount: number
  invalidBarcodeCount: number
  outsideGeoFence: number
  suspiciousActivity: number
}

export interface RelatedScheme {
  id: string
  schemeName: string
  schemeType: string
  status: 'active' | 'upcoming' | 'expired'
}

export interface RelatedRewardSummary {
  totalRewardsGenerated: number
  dealerRewards: number
  chemistRewards: number
  redeemedRewards: number
}

export interface ScanAnalyticsRow {
  batchNumber: string
  product: string
  successfulScans: number
  failedScans: number
  duplicateScans: number
  pendingScans: number
  rewardPointsIssued: number
}

export interface ProductionBatch {
  id: string
  batchNo: string
  productCode: string
  productName: string
  productCategory: string
  manufacturingDate: string
  expiryDate: string
  totalPackages: number
  qrBarcodeGenerated: boolean
  totalScans: number
  coinValue: number
  status: BatchActiveStatus

  qrBarcodeInfo: QrBarcodeInfo
  distributionJourney: DistributionJourneyEntry[]
  scanStatistics: ScanStatistics
  rewardSummary: RewardSummary
  timeline: BatchLifecycleEntry[]

  uploadHistory: BatchUploadHistoryEntry[]
  qrCodeStatistics: QrCodeStatistics
  fraudDetection: FraudDetectionSummary
  relatedSchemes: RelatedScheme[]
  relatedRewards: RelatedRewardSummary
}
