import {
  mockFactoryBatches,
  getBatchById,
  getContainerById,
  getBoxById,
  addFactoryBatch,
  buildNewBatchFromUpload,
  factoryUploadKpis,
} from '@/features/inventory/mockFactoryUploads'
import type { FactoryBatch, BatchContainer, ContainerBox } from '@/features/inventoryManagement/types/inventoryManagement.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// factory/delivery upload API is available. `uploadFile` currently simulates
// parsing a CSV/Excel file by name only — swap for a real multipart upload.

async function getFactoryBatches(): Promise<FactoryBatch[]> {
  return Promise.resolve(mockFactoryBatches)
}

async function getFactoryBatchDetail(batchId: string): Promise<FactoryBatch | undefined> {
  return Promise.resolve(getBatchById(batchId))
}

async function getContainerDetail(batchId: string, containerId: string): Promise<BatchContainer | undefined> {
  return Promise.resolve(getContainerById(batchId, containerId))
}

async function getBoxDetail(batchId: string, containerId: string, boxId: string): Promise<ContainerBox | undefined> {
  return Promise.resolve(getBoxById(batchId, containerId, boxId))
}

async function getFactoryUploadKpis() {
  return Promise.resolve(factoryUploadKpis)
}

/** Same shape used for both "Factory Inventory Upload" and "Delivery Upload" flows. */
async function uploadFile(file: File): Promise<FactoryBatch> {
  const batch = buildNewBatchFromUpload(file.name)
  addFactoryBatch(batch)
  return Promise.resolve(batch)
}

export const factoryUploadService = {
  getFactoryBatches,
  getFactoryBatchDetail,
  getContainerDetail,
  getBoxDetail,
  getFactoryUploadKpis,
  uploadFile,
}
