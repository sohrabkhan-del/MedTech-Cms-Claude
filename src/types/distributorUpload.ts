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

/** An imported distributor, as shown in the Distributor Upload listing after a successful import. */
export interface DistributorRecord {
  id: string
  distributorName: string
  distributorCode: string
  contactPerson: string
  phone: string
  email: string
  city: string
  region: 'North' | 'South' | 'East' | 'West'
  gstNumber: string
  address: string
  status: 'active' | 'inactive'
  uploadFile: string
  uploadedDate: string
}
