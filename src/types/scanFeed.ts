import type { PartnerZone } from '@/types/partner'

export type ScanUserRole = 'Dealer' | 'Chemist'

export type ScanResult =
  | 'success'
  | 'failed_outside_geofence'
  | 'failed_duplicate_scan'
  | 'failed_invalid_code'

export interface ScanValidationDetails {
  codeValidation: 'passed' | 'failed'
  duplicateScanCheck: 'passed' | 'failed'
  geoFenceValidation: 'passed' | 'failed'
  productEligibility: 'passed' | 'failed'
  rewardEligibility: 'passed' | 'failed'
}

export interface ScanGeoLocation {
  latitude: number
  longitude: number
  registeredGeoFenceRadiusMeters: number
  distanceFromRegisteredMeters: number
  geoFenceValidationResult: 'within_range' | 'outside_range'
}

export interface ScanTechnicalInfo {
  sourceIp: string
  deviceInfo: string
  appVersion: string
}

export interface ScanEvent {
  id: string
  scanDateTime: string
  userId: string
  userName: string
  userRole: ScanUserRole
  businessName: string
  scanCode: string
  productName: string
  productCode: string
  batchNumber: string
  region: PartnerZone
  result: ScanResult
  rewardPoints: number
  validation: ScanValidationDetails
  location: ScanGeoLocation
  technical: ScanTechnicalInfo
}

export interface ScanUserSummary {
  userId: string
  userName: string
  role: ScanUserRole
  contactNumber: string
  email: string
  city: string
  address: string
  zone: PartnerZone
  businessName: string
  businessNames: string[]
  status: 'active' | 'inactive'
  lastScanDateTime: string
  totalScans: number
  successfulScans: number
  failedScans: number
  totalPointsEarned: number
}
