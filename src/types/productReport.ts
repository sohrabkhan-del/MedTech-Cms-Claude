import type { ProductAuditEntry, ProductMovementEntry, ProductStatus, ProductTimelineEntry } from '@/types/product'

export interface ProductReportEntry {
  id: string
  productId: string
  productCode: string
  productName: string
  productCategory: string
  batch: string
  totalScans: number
  rewardPoints: number
  status: ProductStatus

  brand: string
  sku: string
  mrp: number
  description: string
  uploadedDate: string

  dealerRewardPoints: number
  chemistRewardPoints: number
  totalDealerAllocations: number
  totalChemistAllocations: number
  totalFactoryUploads: number
  totalQrCodesGenerated: number

  movementHistory: ProductMovementEntry[]
  auditHistory: ProductAuditEntry[]
  timeline: ProductTimelineEntry[]
}
