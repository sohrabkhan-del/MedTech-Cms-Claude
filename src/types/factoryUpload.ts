export type ProductTraceabilityStatus = 'manufactured' | 'dealer_assigned' | 'chemist_assigned' | 'scanned' | 'redeemed'
export type ScanStatus = 'scanned' | 'not_scanned' | 'duplicate_attempt'
export type RewardStatus = 'issued' | 'pending' | 'not_applicable'
export type AllocationStatus = 'allocated' | 'pending'

export interface BoxProduct {
  id: string
  serialNumber: string
  barcodeNumber: string
  productStatus: ProductTraceabilityStatus

  allocatedDealer: string
  dealerCode: string
  dealerAllocationDate: string
  dealerAllocationStatus: AllocationStatus

  allocatedChemist: string
  chemistCode: string
  chemistAllocationDate: string
  currentHolder: string

  currentStatus: string
  scanStatus: ScanStatus
  rewardPoints: number
  lastScanDate: string

  scanDate: string
  scanTime: string
  scanBy: string
  scanLocation: string
  geoFenceStatus: string
  scanResult: string
  rewardPointsEarned: number

  dealerRewardPoints: number
  chemistRewardPoints: number
  rewardScheme: string
  walletTransactionId: string
  redemptionStatus: string

  traceabilityStatus: ProductTraceabilityStatus
}

export interface ContainerBox {
  id: string
  boxNumber: string
  productCount: number
  status: string
  products: BoxProduct[]
}

export interface BatchContainer {
  id: string
  containerNumber: string
  boxCount: number
  productCount: number
  status: string
  boxes: ContainerBox[]
}

export interface BatchAuditEntry {
  id: string
  date: string
  action: string
  performedBy: string
  remarks: string
}

export type BatchTimelineActivity =
  | 'Factory Production'
  | 'Batch Created'
  | 'Container Packed'
  | 'Dealer Allocation'
  | 'Chemist Allocation'
  | 'Barcode Scanned'
  | 'Reward Credited'
  | 'Redeemed'

export interface BatchTimelineEntry {
  id: string
  activity: BatchTimelineActivity
  dateTime: string
}

export interface FactoryBatch {
  id: string
  batchName: string
  batchNumber: string
  batchDate: string
  quantity: number
  startSerialNumber: string
  endSerialNumber: string
  masterStartNumber: string
  masterEndNumber: string
  totalContainers: number
  totalProducts: number

  uploadId: string
  productionPlanNumber: string
  productName: string
  productCode: string
  batchCompletionDate: string
  assemblyLine: string
  exportType: string
  plugType: string
  issuedBy: string
  month: string
  retentionSampleQuantity: number
  remarks: string

  totalAccepted: number
  totalRejected: number

  barcodeRangeStart: string
  barcodeRangeEnd: string
  processingSummary: string
  acceptedProducts: number
  rejectedProducts: number
  pendingProducts: number

  totalAssignedToDealers: number
  totalAssignedToChemists: number
  totalScanned: number
  totalPendingAllocation: number
  duplicateScanAttempts: number
  totalRewardsIssued: number

  hasRedemption: boolean

  containers: BatchContainer[]
  auditHistory: BatchAuditEntry[]
  timeline: BatchTimelineEntry[]
}
