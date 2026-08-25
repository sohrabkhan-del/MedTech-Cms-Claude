/** One row of the factory production upload, matching the API's `rows[]` schema exactly. */
export interface FactoryProductionUploadRow {
  productCode: string
  batchNo: string
  productionPlanNumber: string
  batchIssuedDate: string
  batchIssuedByName: string
  month: string
  qty: number
  sampleQty: number
  plugType: string
  domestic: number
  export: number
  assyLineNo: string
  batchCompletedDate: string
  producedQty: number
  startSerialNumber: number
  endSerialNumber: number
  masterCartonStartNo: number
  masterCartonEndNo: number
}

export interface FactoryProductionUploadBatch {
  id: string
  uploadFileName: string
  uploadedAt: string
  totalRows: number
}

export interface FactoryProductionUploadRowRecord extends FactoryProductionUploadRow {
  id: string
  uploadBatchId: string
  productId?: string
  uploadedBy?: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

/** Upload-batch header as returned by the list endpoint GET /products/upload (no rows). */
export interface FactoryProductionUploadBatchSummary {
  id: string
  totalRows: number
  uploadedBy: string
  isDeleted: boolean
  createdAt: string
  fileName?: string
  uploadFileName: string
  updatedAt: string
}

/** Full upload-batch record returned by GET /products/upload/{id}, with its rows embedded. */
export interface FactoryProductionUploadBatchDetail extends FactoryProductionUploadBatchSummary {
  rows: FactoryProductionUploadRowRecord[]
}

/** Paginated list of upload batches from GET /products/upload?page&limit. */
export interface FactoryProductionUploadBatchList {
  items: FactoryProductionUploadBatchSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface FactoryProductionPreviewRow extends FactoryProductionUploadRow {
  id: string
  rowNo: number
  action: 'add' | 'skip' | 'duplicate' | 'invalid'
  isValid: boolean
  reason?: string
}

export interface FactoryProductionUploadPreview {
  rows: FactoryProductionPreviewRow[]
  totalRows: number
  addableRows: number
  duplicateRows: number
  invalidRows: number
  skippedRows: number
}
