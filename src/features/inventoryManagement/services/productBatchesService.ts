import {
  mockProductBatches,
  getProductBatchById,
  productBatchKpis,
  getMockProductionBatches,
  getProductionBatchById,
  getProductionBatchKpis,
  getScanAnalyticsRows as getScanAnalyticsRowsData,
  buildProductionBatchFromUpload,
  addProductionBatches,
} from '@/features/inventoryManagement/mockProductBatches'
import type { ProductBatch, ProductionBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { MappedBatch } from '@/types/batchUidUpload'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// product batches API is available.

async function getProductBatches(): Promise<ProductBatch[]> {
  return mockDelay(mockProductBatches)
}

async function getProductBatchDetail(id: string): Promise<ProductBatch | undefined> {
  return mockDelay(getProductBatchById(id))
}

async function getProductBatchKpis() {
  return mockDelay(productBatchKpis)
}

async function getProductionBatches(): Promise<ProductionBatch[]> {
  return mockDelay(getMockProductionBatches())
}

async function getProductionBatchDetail(id: string): Promise<ProductionBatch | undefined> {
  return mockDelay(getProductionBatchById(id))
}

async function getProductionBatchKpisData() {
  return mockDelay(getProductionBatchKpis())
}

async function getScanAnalyticsRows() {
  return mockDelay(getScanAnalyticsRowsData())
}

/** Imports Batch & UID Upload results (Upload Manifest) into the Product Batches registry. */
async function importUploadedBatches(mappedBatches: MappedBatch[], uploadFileName: string): Promise<ProductionBatch[]> {
  const batches = mappedBatches.map((mb) => buildProductionBatchFromUpload(mb, uploadFileName))
  addProductionBatches(batches)
  return mockDelay(batches)
}

export const productBatchesService = {
  getProductBatches,
  getProductBatchDetail,
  getProductBatchKpis,
  getProductionBatches,
  getProductionBatchDetail,
  getProductionBatchKpis: getProductionBatchKpisData,
  getScanAnalyticsRows,
  importUploadedBatches,
}
