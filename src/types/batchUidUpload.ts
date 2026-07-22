export interface BmrBatchRow {
  id: string
  productCode: string
  batchNumber: string
  productionPlanNumber: string
  batchIssuedDate: string
  batchIssuedByName: string
  month: string
  qty: number
  sampleQty: number
  plugType: string
  domesticExport: string
  assyLineNo: string
  batchCompletedDate: string
  producedQty: number
  startSerialNumber: string
  endSerialNumber: string
  isValid: boolean
  validationNote?: string
}

export interface BmrValidationSummary {
  totalRows: number
  validRows: number
  duplicateBatches: number
  invalidRanges: number
  totalUidsGenerated: number
}

export interface GeneratedUid {
  id: string
  uid: string
  serialNumber: string
  batchNumber: string
  productCode: string
}

export interface MappedBatch {
  id: string
  batchNumber: string
  productCode: string
  producedQty: number
  uidCount: number
  startSerialNumber: string
  endSerialNumber: string
}
