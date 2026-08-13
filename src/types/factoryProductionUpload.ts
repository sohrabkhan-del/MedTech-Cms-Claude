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
}
