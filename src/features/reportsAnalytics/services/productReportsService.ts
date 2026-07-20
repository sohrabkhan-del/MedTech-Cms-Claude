import {
  mockProductReports,
  getProductReportById,
  productReportKpis,
  productReportCategoryOptions,
  productReportBatchOptions,
} from '@/features/reports/mockProductReports'
import type { ProductReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

async function getProductReports(): Promise<ProductReportEntry[]> {
  return Promise.resolve(mockProductReports)
}

async function getProductReportDetail(id: string): Promise<ProductReportEntry | undefined> {
  return Promise.resolve(getProductReportById(id))
}

async function getProductReportKpis() {
  return Promise.resolve(productReportKpis)
}

async function getProductReportFilterOptions() {
  return Promise.resolve({
    categoryOptions: productReportCategoryOptions,
    batchOptions: productReportBatchOptions,
  })
}

export const productReportsService = {
  getProductReports,
  getProductReportDetail,
  getProductReportKpis,
  getProductReportFilterOptions,
}
