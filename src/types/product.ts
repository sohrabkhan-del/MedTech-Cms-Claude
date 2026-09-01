export type ProductStatus = 'active' | 'inactive'
export type RewardConfigStatus = 'configured' | 'pending'
export type MovementScannedStatus = 'pending' | 'completed'

export interface ProductCategoryRef {
  id: string
  categoryCode: string
  categoryName: string
}

export interface ProductRegionConfig {
  regionId: string
  regionName: string
  dealerMultiplier: number | null
  chemistMultiplier: number | null
}

export interface ProductMovementEntry {
  id: string
  factoryUploadBatch: string
  quantityUploaded: number
  startSerialNo: string
  endSerialNo: string
  containerStartSerialNo: string
  containerEndSerialNo: string
  scannedStatus: MovementScannedStatus
}

export interface ProductAuditEntry {
  id: string
  date: string
  action: string
  performedBy: string
  previousValue: string
  updatedValue: string
}

export type ProductTimelineActivity =
  | 'Product Created'
  | 'Reward Points Updated'
  | 'Description Updated'
  | 'Activated'
  | 'Deactivated'

export interface ProductTimelineEntry {
  id: string
  activity: ProductTimelineActivity
  dateTime: string
}

export interface Product {
  id: string
  productName: string
  productCode: string
  productCategory: string
  categoryId?: string
  category?: ProductCategoryRef | null
  status: ProductStatus
  uploadedDate: string

  description: string
  productImages: string[]
  sku: string
  brand: string
  mrp: number
  manufacturingDetails: string
  createdDate: string
  lastUpdatedDate: string

  dealerRewardPoints: number
  chemistRewardPoints: number
  dealerContainerPoints: number
  dealerProductPoints: number
  chemistContainerPoints: number
  chemistProductPoints: number
  rewardConfigStatus: RewardConfigStatus
  regions: ProductRegionConfig[]
  totalQuantity: number
  totalScanQuantity: number

  totalFactoryUploads: number
  totalQrCodesGenerated: number
  totalSuccessfulScans: number
  totalDealerAllocations: number
  totalChemistAllocations: number
  totalRewardPointsIssued: number
  totalSecurityAlerts: number
  totalShownInterest: number

  movementHistory: ProductMovementEntry[]
  auditHistory: ProductAuditEntry[]
  timeline: ProductTimelineEntry[]
}
