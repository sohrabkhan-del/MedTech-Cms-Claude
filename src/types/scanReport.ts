export type ScanReportResult = 'valid' | 'duplicate' | 'invalid'
export type ScanReportUserType = 'Dealer' | 'Chemist'
export type ScanReportWalletStatus = 'credited' | 'pending' | 'failed'

export interface ScanReportTimelineEntry {
  id: string
  activity:
    | 'Barcode Scanned'
    | 'Scan Validated'
    | 'Duplicate Scan Detected'
    | 'Invalid Barcode Flagged'
    | 'Reward Calculated'
    | 'Wallet Credited'
    | 'Wallet Credit Failed'
  dateTime: string
}

export interface ScanReportEntry {
  id: string
  scanDateTime: string
  barcodeNumber: string

  productId: string
  productName: string
  productCode: string
  productCategory: string
  batchNumber: string

  dealerId?: string
  dealerName?: string
  chemistId?: string
  chemistName?: string

  scanResult: ScanReportResult
  device: string
  ipAddress: string

  locationName: string
  latitude: number
  longitude: number

  baseRewardPoints: number
  bonusPoints: number
  rewardPoints: number
  appliedScheme: string
  walletStatus: ScanReportWalletStatus
  walletTransactionId?: string

  timeline: ScanReportTimelineEntry[]
}
