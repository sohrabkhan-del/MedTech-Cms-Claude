export type ScanStatus = 'valid' | 'duplicate' | 'invalid'
export type WalletStatus = 'credited' | 'pending' | 'failed'
export type PartnerKind = 'Dealer' | 'Chemist'

export interface ScanHistoryEntry {
  id: string
  scanDateTime: string
  userName: string
  userType: PartnerKind | 'Distributor'
  scanResult: ScanStatus
  rewardPoints: number
  device: string
  ipAddress: string
}

export interface OwnershipTimelineEntry {
  id: string
  activity:
    | 'Product Created'
    | 'Batch Generated'
    | 'Assigned to Distributor'
    | 'Assigned to Dealer'
    | 'Purchased by Chemist'
    | 'Barcode Scanned'
    | 'Reward Calculated'
    | 'Wallet Credited'
  dateTime: string
}

export interface AuditTimelineEntry {
  id: string
  activity:
    | 'Product Created'
    | 'Batch Generated'
    | 'Barcode Generated'
    | 'Distributor Assigned'
    | 'Dealer Assigned'
    | 'Chemist Purchase'
    | 'Barcode Scanned'
    | 'Reward Calculated'
    | 'Wallet Credited'
    | 'Security Alert Generated'
  dateTime: string
  flagged?: boolean
}

export interface MasterScanLogEntry {
  id: string
  productCode: string
  productName: string
  productCategory: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  barcodeNumber: string

  distributor: string
  dealer?: string
  chemist?: string

  scanDateTime: string
  scanLocation: string
  scanResult: ScanStatus
  device: string
  ipAddress: string

  baseRewardPoints: number
  appliedScheme: string
  bonusPoints: number
  totalRewardPoints: number
  walletStatus: WalletStatus
  walletTransactionId?: string

  scanHistory: ScanHistoryEntry[]
  ownershipTimeline: OwnershipTimelineEntry[]
  auditTimeline: AuditTimelineEntry[]
}
