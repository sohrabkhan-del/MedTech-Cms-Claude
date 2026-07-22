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
  return mockDelay(mockProductionBatches)
}

async function getProductionBatchDetail(id: string): Promise<ProductionBatch | undefined> {
  return mockDelay(getProductionBatchById(id))
}

async function getProductionBatchKpis() {
  return mockDelay(productionBatchKpis)
}

async function getScanAnalyticsRows() {
  return mockDelay(scanAnalyticsRows)
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
