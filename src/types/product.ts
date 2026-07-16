export type ProductStatus = 'active' | 'inactive'
export type RewardConfigStatus = 'configured' | 'pending'

export interface ProductMovementEntry {
  id: string
  factoryUploadBatch: string
  containerNumber: string
  quantityUploaded: number
  assignedDealer: string
  assignedChemist: string
  scanCount: number
  currentStatus: ProductStatus
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
  rewardConfigStatus: RewardConfigStatus

  totalFactoryUploads: number
  totalQrCodesGenerated: number
  totalSuccessfulScans: number
  totalDealerAllocations: number
  totalChemistAllocations: number
  totalRewardPointsIssued: number

  movementHistory: ProductMovementEntry[]
  auditHistory: ProductAuditEntry[]
  timeline: ProductTimelineEntry[]
}
