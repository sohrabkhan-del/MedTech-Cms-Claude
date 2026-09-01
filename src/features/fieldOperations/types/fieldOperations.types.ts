export const REWARD_REASON = {
  NONE: 'NONE',
  OTHER: 'OTHER',
  REWARD_GRANTED: 'REWARD_GRANTED',
  NO_REWARD_CONFIGURED: 'NO_REWARD_CONFIGURED',
  SCAN_OUTSIDE_GEOFENCE: 'SCAN_OUTSIDE_GEOFENCE',
  SCAN_OUTSIDE_GEOTAG_RADIUS: 'SCAN_OUTSIDE_GEOTAG_RADIUS',
  PRODUCT_ALREADY_SCANNED: 'PRODUCT_ALREADY_SCANNED',
  SCAN_CODE_ALREADY_CLAIMED: 'SCAN_CODE_ALREADY_CLAIMED',
  INVALID_SCAN_CODE: 'INVALID_SCAN_CODE',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_POINT_NOT_FOUND: 'PRODUCT_POINT_NOT_FOUND',
  BATCH_NOT_FOUND: 'BATCH_NOT_FOUND',
  PARTNER_NOT_FOUND: 'PARTNER_NOT_FOUND',
  PARTNER_NOT_GEOTAGGED: 'PARTNER_NOT_GEOTAGGED',
  PARTNER_BUSINESS_NOT_APPROVED: 'PARTNER_BUSINESS_NOT_APPROVED',
  PARTNER_INACTIVE: 'PARTNER_INACTIVE',
} as const

export type RewardReason = (typeof REWARD_REASON)[keyof typeof REWARD_REASON]

export type {
  ScanEvent,
  ScanEventDetail,
  ScanUserRole,
  ScanStatus,
  ScanBusinessDetails,
  ScanProductDetails,
  ScanTechnicalInfo,
} from '@/types/scanFeed'
export type {
  SecurityAlert,
  SecurityAlertDetail,
  AlertSeverity,
  AlertStatus,
  AlertType,
  SecurityAlertPartnerRef,
  SecurityAlertBusinessDetails,
  SecurityAlertProductDetails,
  SecurityAlertProductUpload,
} from '@/types/securityAlert'
export type {
  GeoFence,
  GeoFenceUserType,
  GeoFenceStatus,
  GeoFenceVerificationEntry,
  GeoFenceScanEntry,
  GeoFenceAuditEntry,
} from '@/types/geoFence'
export {
  geoFenceFormSchema,
  geoFenceFormDefaults,
  type GeoFenceFormValues,
} from '@/features/fieldOperations/geoFenceFormSchema'
