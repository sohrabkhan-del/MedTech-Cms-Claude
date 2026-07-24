import {
  addDispatchInvoice,
  getDispatchInvoiceById,
  getMockDispatchInvoices,
} from '@/features/inventoryManagement/mockDistributorUpload'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type { DispatchInvoice, DispatchUploadRow } from '@/types/distributorUpload'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// distributor upload API is available.

async function confirmImport(
  rows: DispatchUploadRow[],
  uploadFileName: string,
  invoiceMeta: DispatchInvoiceMeta,
): Promise<DispatchInvoice> {
  return mockDelay(addDispatchInvoice(rows, uploadFileName, invoiceMeta), 700)
}

async function getDispatchInvoices(): Promise<DispatchInvoice[]> {
  return mockDelay(getMockDispatchInvoices())
}

async function getDispatchInvoiceDetail(
  id: string,
): Promise<DispatchInvoice | undefined> {
  return mockDelay(getDispatchInvoiceById(id))
}

export const distributorUploadService = {
  confirmImport,
  getDispatchInvoices,
  getDispatchInvoiceDetail,
}
