import type { OnboardedBy, PartnerZone } from '@/types/partner'

export type RequestType = 'Dealer' | 'Chemist'
export type RegisteredBy = 'Self' | 'MR' | 'Admin'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type GeoVerificationStatus = 'verified' | 'unverified' | 'flagged'
export type DocumentVerificationStatus = 'verified' | 'pending' | 'rejected'

export interface RequestDocument {
  id: string
  documentName: string
  uploadDate: string
  verificationStatus: DocumentVerificationStatus
}

export type RequestTimelineActivity =
  | 'Request Submitted'
  | 'Under Review'
  | 'Documents Verified'
  | 'Geo-tag Verified'
  | 'Approved'
  | 'Rejected'
  | 'Remarks Added'
  | 'Reopened'

export interface RequestTimelineEntry {
  id: string
  activity: RequestTimelineActivity
  dateTime: string
}

export interface RequestAuditEntry {
  id: string
  date: string
  action: string
  performedBy: string
  remarks: string
}

export interface ApprovalRequest {
  id: string
  applicantName: string
  requestType: RequestType
  status: ApprovalStatus
  city: string
  region: PartnerZone
  submittedDate: string
  registeredBy: RegisteredBy
  onboardedType: OnboardedBy
  onboardedBy: string

  storeName: string
  ownerName: string
  email: string
  mobileNumber: string
  completeAddress: string

  drugLicenseNumber: string
  gstNumber?: string
  businessCategory: string

  latitude: number
  longitude: number
  assignedZone: PartnerZone
  geoVerificationStatus: GeoVerificationStatus

  documents: RequestDocument[]

  requestCreatedDate: string
  submittedBy: string
  lastUpdated: string
  reviewedBy?: string
  decisionDate?: string
  remarks?: string
  rejectionReason?: string

  timeline: RequestTimelineEntry[]
  auditHistory: RequestAuditEntry[]
}
