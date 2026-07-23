import {
  addDistributors,
  generateMockDistributorRows,
  getDistributorById,
  getMockDistributors,
} from '@/features/inventoryManagement/mockDistributorUpload'
import type {
  DistributorRecord,
  DistributorUploadRow,
  DistributorUploadSummary,
} from '@/types/distributorUpload'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// distributor upload API is available.

async function previewUpload(
  fileName: string,
): Promise<{
  rows: DistributorUploadRow[]
  summary: DistributorUploadSummary
}> {
  return mockDelay(generateMockDistributorRows(fileName), 500)
}

async function confirmImport(
  rows: DistributorUploadRow[],
  uploadFileName: string,
): Promise<DistributorRecord[]> {
  return mockDelay(addDistributors(rows, uploadFileName), 700)
}

async function getDistributors(): Promise<DistributorRecord[]> {
  return mockDelay(getMockDistributors())
}

async function getDistributorDetail(
  id: string,
): Promise<DistributorRecord | undefined> {
  return mockDelay(getDistributorById(id))
}

export const distributorUploadService = {
  previewUpload,
  confirmImport,
  getDistributors,
  getDistributorDetail,
}
