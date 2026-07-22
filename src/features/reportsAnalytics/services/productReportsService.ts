import {
  mockProductReports,
  getProductReportById,
  productReportKpis,
  productReportCategoryOptions,
  productReportBatchOptions,
} from '@/features/reportsAnalytics/mockProductReports'
import type { ProductReportEntry } from '@/features/reportsAnalytics/types/reportsAnalytics.types'
import { mockDelay } from '@/services/mockDelay'

async function getProductReports(): Promise<ProductReportEntry[]> {
  return mockDelay(mockProductReports)
}

async function getProductReportDetail(id: string): Promise<ProductReportEntry | undefined> {
  return mockDelay(getProductReportById(id))
}

async function getProductReportKpis() {
  return mockDelay(productReportKpis)
}

async function getProductReportFilterOptions() {
  return mockDelay({
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
