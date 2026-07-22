export interface DistributorUploadRow {
  id: string
  distributorName: string
  distributorCode: string
  contactPerson: string
  phone: string
  email: string
  city: string
  region: 'North' | 'South' | 'East' | 'West'
  gstNumber: string
  isValid: boolean
  validationNote?: string
}

export interface DistributorUploadSummary {
  totalRows: number
  validRows: number
  duplicateCodes: number
  invalidGst: number
}
