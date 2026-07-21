import type { PartnerZone } from '@/types/partner'
import type { ScanUserRole } from '@/types/scanFeed'

export type AlertSeverity = 'high' | 'medium' | 'low'

export type AlertType =
  | 'Duplicate Barcode Scan'
  | 'Geo-fence Violation'
  | 'Multiple Failed Scan Attempts'
  | 'Unauthorized Device Login'
  | 'Suspicious Scan Frequency'

export type SecurityTimelineActivity =
  | 'Duplicate Barcode Scan'
  | 'Geo-fence Violation'
  | 'Multiple Failed Scan Attempts'
  | 'Unauthorized Device Login'
  | 'Suspicious Scan Frequency'
  | 'Account Activated'
  | 'Account Deactivated'

export interface SecurityAlert {
  id: string
  alertType: AlertType
  description: string
  userId: string
  userName: string
  userType: ScanUserRole
  affectedUserId: string
  affectedUserName: string
  affectedUserType: ScanUserRole
  requestSource: string
  severity: AlertSeverity
  alertDateTime: string
  sourceIp: string
  userStatus: 'active' | 'inactive'
}

export interface SecurityTimelineEntry {
  id: string
  activity: SecurityTimelineActivity
  dateTime: string
}

export interface UserSecuritySummary {
  userId: string
  userName: string
  userType: ScanUserRole
  mobileNumber: string
  email: string
  region: PartnerZone
  status: 'active' | 'inactive'
  totalAlerts: number
  highSeverityAlerts: number
  lastAlertDate: string
  lastKnownLocation: string
  sourceIp: string
  deviceInfo: string
  registeredDevice: string
}
