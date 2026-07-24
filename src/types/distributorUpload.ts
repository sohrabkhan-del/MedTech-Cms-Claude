export interface DispatchLineItem {
  id: string
  srNo: number
  itemCode: string
  itemName: string
  cartonNo: string
  cartonWeight: number
  dispatchQty: number
}

export interface DispatchInvoice {
  id: string
  invoiceNo: string
  customerName: string
  transporter: string
  vehicleNo: string
  totalBoxQty: number
  date: string
  formatNo: string
  revNo: string
  revDate: string
  uploadFile: string
  uploadedDate: string
  lineItems: DispatchLineItem[]
}

export interface DispatchUploadRow {
  id: string
  srNo: number
  itemCode: string
  itemName: string
  cartonNo: string
  cartonWeight: number
  dispatchQty: number
  isValid: boolean
  validationNote?: string
}

export interface DispatchUploadSummary {
  totalRows: number
  validRows: number
  duplicateCartons: number
  invalidWeights: number
}
