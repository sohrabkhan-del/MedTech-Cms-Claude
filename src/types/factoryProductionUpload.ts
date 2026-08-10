/** One row of the factory production upload, matching the API's `rows[]` schema exactly. */
export interface FactoryProductionUploadRow {
  ProductCode: string
  BatchNo: string
  ProductionPlanNumber: string
  BatchIssuedDate: string
  BatchIssuedByName: string
  Month: string
  Qty: number
  SampleQty: number
  PlugType: string
  Domestic: number
  Export: number
  AssyLineNo: string
  BatchCompletedDate: string
  ProducedQty: number
  StartSerialNumber: number
  EndSerialNumber: number
  MasterCartonStartNo: number
  MasterCartonEndNo: number
}

export interface FactoryProductionUploadBatch {
  id: string
  uploadFileName: string
  uploadedAt: string
  totalRows: number
}

export interface FactoryProductionUploadRowRecord extends FactoryProductionUploadRow {
  id: string
  uploadId: string
}
