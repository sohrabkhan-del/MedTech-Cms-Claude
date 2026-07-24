import {
  mockFactoryBatches,
  getBatchById,
  getContainerById,
  getBoxById,
  addFactoryBatch,
  buildNewBatchFromUpload,
  buildFactoryBatchFromBmrRow,
  factoryUploadKpis,
} from '@/features/inventoryManagement/mockFactoryUploads'
import type {
  FactoryBatch,
  BatchContainer,
  ContainerBox,
} from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { BmrBatchRow } from '@/types/batchUidUpload'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// factory/delivery upload API is available. `uploadFile` currently simulates
// parsing a CSV/Excel file by name only — swap for a real multipart upload.

async function getFactoryBatches(): Promise<FactoryBatch[]> {
  return mockDelay(mockFactoryBatches)
}

async function getFactoryBatchDetail(
  batchId: string,
): Promise<FactoryBatch | undefined> {
  return mockDelay(getBatchById(batchId))
}

async function getContainerDetail(
  batchId: string,
  containerId: string,
): Promise<BatchContainer | undefined> {
  return mockDelay(getContainerById(batchId, containerId))
}

async function getBoxDetail(
  batchId: string,
  containerId: string,
  boxId: string,
): Promise<ContainerBox | undefined> {
  return mockDelay(getBoxById(batchId, containerId, boxId))
}

async function getFactoryUploadKpis() {
  return mockDelay(factoryUploadKpis)
}

/** Same shape used for both "Factory Inventory Upload" and "Delivery Upload" flows. */
async function uploadFile(
  manifestFile: File,
  supportingFile: File,
): Promise<FactoryBatch> {
  const batch = buildNewBatchFromUpload(
    `${manifestFile.name}+${supportingFile.name}`,
  )
  addFactoryBatch(batch)
  return mockDelay(batch)
}

/** Imports a Batch & UID Upload (BMR) result into the Active Product Registry Directory listing — one row per valid BMR batch, using its real uploaded fields. */
async function importBmrUpload(
  batchRows: BmrBatchRow[],
  uploadFileName: string,
  containerCountByBatch: Record<string, number>,
): Promise<FactoryBatch[]> {
  const batches = batchRows
    .filter((row) => row.isValid)
    .map((row) =>
      buildFactoryBatchFromBmrRow(
        row,
        uploadFileName,
        containerCountByBatch[row.batchNumber] ?? 0,
      ),
    )
  batches.forEach(addFactoryBatch)
  return mockDelay(batches)
}

export const factoryUploadService = {
  getFactoryBatches,
  getFactoryBatchDetail,
  getContainerDetail,
  getBoxDetail,
  getFactoryUploadKpis,
  uploadFile,
  importBmrUpload,
}
