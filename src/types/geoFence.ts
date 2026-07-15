import type { PartnerZone } from '@/types/partner'

export type GeoFenceUserType = 'Dealer' | 'Chemist' | 'MR'
export type GeoFenceStatus = 'active' | 'pending' | 'inactive'

export interface GeoFenceVerificationEntry {
  id: string
  date: string
  verifiedBy: string
  previousRadiusMeters: number
  newRadiusMeters: number
  remarks: string
}

export interface GeoFenceScanEntry {
  id: string
  scanDate: string
  user: string
  location: string
  distanceMeters: number
  result: 'valid' | 'invalid'
  status: 'within_fence' | 'outside_fence'
}

export type GeoFenceTimelineActivity = 'Geo Fence Created' | 'Radius Updated' | 'Verification Completed' | 'Activated' | 'Deactivated'

export interface GeoFenceTimelineEntry {
  id: string
  activity: GeoFenceTimelineActivity
  dateTime: string
}

export interface GeoFenceAuditEntry {
  id: string
  date: string
  action: string
  performedBy: string
  remarks: string
}

export interface GeoFence {
  id: string
  userName: string
  userType: GeoFenceUserType
  linkedUserId?: string
  region: PartnerZone
  zone: PartnerZone
  latitude: number
  longitude: number
  radiusMeters: number
  bufferDistanceMeters: number
  lastVerified: string
  status: GeoFenceStatus
  verificationHistory: GeoFenceVerificationEntry[]
  scanHistory: GeoFenceScanEntry[]
  timeline: GeoFenceTimelineEntry[]
  auditHistory: GeoFenceAuditEntry[]
}
