import type {
  ApprovalRequest,
  ApprovalStatus,
  DocumentVerificationStatus,
  GeoVerificationStatus,
  RegisteredBy,
  RequestAuditEntry,
  RequestDocument,
  RequestTimelineEntry,
} from '@/types/approvalRequest'
import type { OnboardedBy } from '@/types/partner'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mrs } from '@/features/userManagement/mockPartnerData'

const rejectionReasons = [
  'Incomplete documents',
  'Invalid drug license',
  'Duplicate registration',
  'Geo-tag verification failed',
  'Unable to verify business details',
]

const businessCategories = ['Retail Pharmacy', 'Wholesale Distributor', 'Medical Godown', 'Chemist Shop', 'Super Stockist']

const requestUsers = [
  ...mockDealers.map((partner) => ({ partner, requestType: 'Dealer' as const })),
  ...mockChemists.map((partner) => ({ partner, requestType: 'Chemist' as const })),
]

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateFromSeed(seed: number, month = 'Jul'): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} 2026`
}

function resolveStatus(seed: number): ApprovalStatus {
  const bucket = seed % 10
  if (bucket < 5) return 'pending'
  if (bucket < 8) return 'approved'
  return 'rejected'
}

function resolveRegisteredBy(seed: number): RegisteredBy {
  const options: RegisteredBy[] = ['Self', 'MR', 'Admin']
  return options[seed % options.length]!
}

function resolveOnboardedType(seed: number): OnboardedBy {
  const options: OnboardedBy[] = ['Self', 'MR']
  return options[seed % options.length]!
}

function resolveGeoVerification(seed: number): GeoVerificationStatus {
  const options: GeoVerificationStatus[] = ['verified', 'verified', 'unverified', 'flagged']
  return options[seed % options.length]!
}

function buildDocuments(seed: number, requestId: string): RequestDocument[] {
  const statuses: DocumentVerificationStatus[] = ['verified', 'pending', 'rejected']
  const names = ['Store Front Image', 'Drug License Copy', 'GST Certificate', 'Identity Proof', 'Additional Supporting Document']
  return names.map((name, i) => ({
    id: `${requestId}-doc-${i}`,
    documentName: name,
    uploadDate: dateFromSeed(seed + i, 'Jun'),
    verificationStatus: statuses[(seed + i) % statuses.length]!,
  }))
}

function buildTimeline(seed: number, requestId: string, status: ApprovalStatus): RequestTimelineEntry[] {
  const timeline: RequestTimelineEntry[] = [
    { id: `${requestId}-tl-0`, activity: 'Request Submitted', dateTime: dateFromSeed(seed) },
    { id: `${requestId}-tl-1`, activity: 'Under Review', dateTime: dateFromSeed(seed + 1) },
    { id: `${requestId}-tl-2`, activity: 'Documents Verified', dateTime: dateFromSeed(seed + 2) },
    { id: `${requestId}-tl-3`, activity: 'Geo-tag Verified', dateTime: dateFromSeed(seed + 3) },
  ]
  if (status === 'approved') {
    timeline.push({ id: `${requestId}-tl-4`, activity: 'Approved', dateTime: dateFromSeed(seed + 4) })
  } else if (status === 'rejected') {
    timeline.push({ id: `${requestId}-tl-4`, activity: 'Rejected', dateTime: dateFromSeed(seed + 4) })
  }
  return timeline
}

function buildAuditHistory(seed: number, requestId: string, status: ApprovalStatus, reviewedBy: string, rejectionReason?: string): RequestAuditEntry[] {
  const history: RequestAuditEntry[] = [
    { id: `${requestId}-audit-0`, date: dateFromSeed(seed), action: 'Request Created', performedBy: 'System', remarks: 'Onboarding request generated automatically.' },
  ]
  if (status === 'approved') {
    history.push({ id: `${requestId}-audit-1`, date: dateFromSeed(seed + 4), action: 'Request Approved', performedBy: reviewedBy, remarks: 'All documents and geo-tag verified.' })
  } else if (status === 'rejected') {
    history.push({ id: `${requestId}-audit-1`, date: dateFromSeed(seed + 4), action: 'Request Rejected', performedBy: reviewedBy, remarks: rejectionReason ?? 'Rejected during review.' })
  }
  return history
}

function buildRequest(seed: number): ApprovalRequest {
  const user = requestUsers[seed % requestUsers.length]!
  const { partner, requestType } = user
  const status = resolveStatus(seed)
  const reviewedBy = mrs[seed % mrs.length]!
  const rejectionReason = status === 'rejected' ? rejectionReasons[seed % rejectionReasons.length]! : undefined

  const id = `AR-${1000 + seed}`
  const onboardedType = resolveOnboardedType(seed)

  return {
    id,
    applicantName: partner.ownerName,
    requestType,
    status,
    city: partner.city,
    region: partner.zone,
    submittedDate: dateFromSeed(seed),
    registeredBy: resolveRegisteredBy(seed),
    onboardedType,
    onboardedBy: onboardedType === 'MR' ? mrs[seed % mrs.length]! : partner.ownerName,

    storeName: partner.shopName,
    ownerName: partner.ownerName,
    email: partner.email,
    mobileNumber: partner.phone,
    completeAddress: partner.registeredAddress,

    drugLicenseNumber: partner.licenseNumber,
    gstNumber: seed % 4 !== 0 ? `GSTIN${29000000 + seed * 13}` : undefined,
    businessCategory: businessCategories[seed % businessCategories.length]!,

    latitude: partner.geoLock.latitude,
    longitude: partner.geoLock.longitude,
    assignedZone: partner.zone,
    geoVerificationStatus: resolveGeoVerification(seed),

    documents: buildDocuments(seed, id),

    requestCreatedDate: dateFromSeed(seed),
    submittedBy: resolveRegisteredBy(seed) === 'Self' ? partner.ownerName : reviewedBy,
    lastUpdated: dateFromSeed(seed + (status === 'pending' ? 1 : 4)),
    reviewedBy: status === 'pending' ? undefined : reviewedBy,
    decisionDate: status === 'pending' ? undefined : dateFromSeed(seed + 4),
    remarks: status === 'approved' ? 'All documents and geo-tag verified.' : undefined,
    rejectionReason,

    timeline: buildTimeline(seed, id, status),
    auditHistory: buildAuditHistory(seed, id, status, reviewedBy, rejectionReason),
  }
}

export const mockApprovalRequests: ApprovalRequest[] = Array.from({ length: 60 }).map((_, index) => buildRequest(index + 1))

export function getApprovalRequestById(id: string): ApprovalRequest | undefined {
  return mockApprovalRequests.find((request) => request.id === id)
}

export const approvalRequestKpis = {
  pending: mockApprovalRequests.filter((r) => r.status === 'pending').length,
  approved: mockApprovalRequests.filter((r) => r.status === 'approved').length,
  rejected: mockApprovalRequests.filter((r) => r.status === 'rejected').length,
  total: mockApprovalRequests.length,
}

const rejectedRequests = mockApprovalRequests.filter((r) => r.status === 'rejected')

export const rejectedRequestKpis = {
  totalRejected: rejectedRequests.length,
  dealerRejections: rejectedRequests.filter((r) => r.requestType === 'Dealer').length,
  chemistRejections: rejectedRequests.filter((r) => r.requestType === 'Chemist').length,
  todaysRejections: rejectedRequests.filter((r) => r.decisionDate === '15 Jul 2026').length,
}
