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
  domestic: string
  export: string
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

/**
 * Reference-only linkage between a generated UID and its Master Carton Number,
 * parsed from an uploaded linkage file (UID + Master Carton Number columns).
 * Phase 1: no line-side scanning yet — this is a manual/reference upload.
 * Phase 2 (future): replaced by real inner-box-to-master-carton scan data.
 */
export interface MasterCartonLinkRow {
  id: string
  uid: string
  masterCartonNumber: string
  isValid: boolean
  validationNote?: string
}

export interface MasterCartonUploadSummary {
  totalRows: number
  validRows: number
  unknownUids: number
  duplicateUids: number
}
