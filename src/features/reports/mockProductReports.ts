import type { ProductReportEntry } from '@/types/productReport'
import { mockProducts, productCategoryOptions } from '@/features/inventory/mockProducts'

function representativeBatch(product: (typeof mockProducts)[number]): string {
  return product.movementHistory[0]?.factoryUploadBatch ?? `BATCH-${2026000 + Number(product.id.replace('product-', '')) * 3}`
}

function buildProductReport(product: (typeof mockProducts)[number]): ProductReportEntry {
  return {
    id: `RPT-PROD-${product.id}`,
    productId: product.id,
    productCode: product.productCode,
    productName: product.productName,
    productCategory: product.productCategory,
    batch: representativeBatch(product),
    totalScans: product.totalSuccessfulScans,
    rewardPoints: product.totalRewardPointsIssued,
    status: product.status,

    brand: product.brand,
    sku: product.sku,
    mrp: product.mrp,
    description: product.description,
    uploadedDate: product.uploadedDate,

    dealerRewardPoints: product.dealerRewardPoints,
    chemistRewardPoints: product.chemistRewardPoints,
    totalDealerAllocations: product.totalDealerAllocations,
    totalChemistAllocations: product.totalChemistAllocations,
    totalFactoryUploads: product.totalFactoryUploads,
    totalQrCodesGenerated: product.totalQrCodesGenerated,

    movementHistory: product.movementHistory,
    auditHistory: product.auditHistory,
    timeline: product.timeline,
  }
}

export const mockProductReports: ProductReportEntry[] = mockProducts.map(buildProductReport)

export function getProductReportById(id: string): ProductReportEntry | undefined {
  return mockProductReports.find((entry) => entry.id === id)
}

export const productReportKpis = {
  totalProducts: mockProductReports.length,
  totalScans: mockProductReports.reduce((sum, r) => sum + r.totalScans, 0),
  rewardPointsIssued: mockProductReports.reduce((sum, r) => sum + r.rewardPoints, 0),
  activeProducts: mockProductReports.filter((r) => r.status === 'active').length,
}

export const productReportCategoryOptions = productCategoryOptions
export const productReportBatchOptions = Array.from(new Set(mockProductReports.map((r) => r.batch))).sort()
