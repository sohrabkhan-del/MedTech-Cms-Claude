export type PartnerZone = 'North' | 'South' | 'East' | 'West'
export type PartnerStatus = 'active' | 'pending' | 'inactive' | 'suspended'
export type OnboardedBy = 'Self' | 'MR'

export interface GeoLockDetails {
  active: boolean
  latitude: number
  longitude: number
  allowedRadiusMeters: number
  lastVerifiedDate: string
  bufferRadiusMeters: number
}

export interface PointsHistoryEntry {
  id: string
  transactionId: string
  date: string
  type: 'credit' | 'debit'
  Points: number
  description: string
  balanceAfter: number
}

export interface ScanHistoryEntry {
  id: string
  scanDate: string
  barcodeNumber: string
  productName: string
  rewardPoints: number
  result: 'valid' | 'duplicate' | 'invalid'
}

export interface InterestedProductEntry {
  id: string
  productName: string
  requestedDate: string
  handledBy: string
  status: 'new' | 'in_progress' | 'closed'
}

export interface LicenseDocument {
  id: string
  documentName: string
  uploadDate: string
  verificationStatus: 'verified' | 'pending' | 'rejected'
  expiryDate: string
  fileUrl?: string
}

export interface PartnerBase {
  id: string
  referenceId?: string
  shopName: string
  ownerName: string
  email: string
  phone: string
  city: string
  zone: PartnerZone
  status: PartnerStatus
  approvalStatus?: string
  licenseNumber: string
  panNumber?: string
  drugLicenseNumber?: string
  drugLicenseExpiry?: string
  onboardedBy: OnboardedBy
  availablePoints: number
  assignedMr: string
  notes?: string
  geoLock: GeoLockDetails
  registeredAddress: string
  totalScans: number
  totalRedemptions: number
  scanHistory: ScanHistoryEntry[]
  PointsHistory: PointsHistoryEntry[]
  interestedProducts: InterestedProductEntry[]
  documents: LicenseDocument[]
}
