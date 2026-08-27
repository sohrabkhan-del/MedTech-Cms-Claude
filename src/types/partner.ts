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

export interface PartnerBusinessDetail {
  id?: string
  outletName: string
  userName?: string
  panNumber?: string
  drugLicenseNumber?: string
  drugLicenseExpiry?: string
  addressType?: 'SHOP' | 'GODOWN' | 'OTHER'
  addressLine1?: string
  addressLine2?: string
  landmark?: string
  city?: string
  district?: string
  state?: string
  country?: string
  pincode?: string
  latitude?: number
  longitude?: number
  scanRadius?: number
  bufferRadius?: number
  geoAccuracy?: number
  regionId?: string
  notes?: string
  documents: LicenseDocument[]
}

export interface PartnerBase {
  id: string
  referenceId?: string
  shopName: string
  ownerName: string
  email: string
  phone: string
  country?: string
  city: string
  zone: PartnerZone
  status: PartnerStatus
  approvalStatus?: string
  profileImageUrl?: string
  licenseNumber: string
  panNumber?: string
  drugLicenseNumber?: string
  drugLicenseExpiry?: string
  regionId?: string
  regionName?: string
  onboardedBy: OnboardedBy
  assignedMr: string
  assignedMrId?: string
  assignedMrName?: string
  assignedMrCode?: string
  assignedMrPhone?: string
  assignedMrEmail?: string
  availablePoints: number
  pointsEarned?: number
  notes?: string
  geoLock: GeoLockDetails
  registeredAddress: string
  totalScans: number
  totalRedemptions: number
  totalRedemption?: number
  interestedProductCount?: number
  scanHistory: ScanHistoryEntry[]
  PointsHistory: PointsHistoryEntry[]
  interestedProducts: InterestedProductEntry[]
  documents: LicenseDocument[]
  /** Raw per-outlet business records from the API, used to rebuild the create/edit form's businesses[] array with each outlet's own discrete address fields. */
  businesses: PartnerBusinessDetail[]
}
