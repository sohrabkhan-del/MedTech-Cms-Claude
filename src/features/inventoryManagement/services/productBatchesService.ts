import {
  mockProductBatches,
  getProductBatchById,
  productBatchKpis,
  mockProductionBatches,
  getProductionBatchById,
  productionBatchKpis,
  scanAnalyticsRows,
} from '@/features/inventoryManagement/mockProductBatches'
import type { ProductBatch, ProductionBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// product batches API is available.

async function getProductBatches(): Promise<ProductBatch[]> {
  return Promise.resolve(mockProductBatches)
}

async function getProductBatchDetail(id: string): Promise<ProductBatch | undefined> {
  return Promise.resolve(getProductBatchById(id))
}

async function getProductBatchKpis() {
  return Promise.resolve(productBatchKpis)
}

async function getProductionBatches(): Promise<ProductionBatch[]> {
  return Promise.resolve(mockProductionBatches)
}

async function getProductionBatchDetail(id: string): Promise<ProductionBatch | undefined> {
  return Promise.resolve(getProductionBatchById(id))
}

async function getProductionBatchKpis() {
  return Promise.resolve(productionBatchKpis)
}

async function getScanAnalyticsRows() {
  return Promise.resolve(scanAnalyticsRows)
}

export const productBatchesService = {
  getProductBatches,
  getProductBatchDetail,
  getProductBatchKpis,
  getProductionBatches,
  getProductionBatchDetail,
  getProductionBatchKpis,
  getScanAnalyticsRows,
}
