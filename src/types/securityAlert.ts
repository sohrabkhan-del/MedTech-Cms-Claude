export type AlertSeverity = 'high' | 'medium' | 'low'

export type AlertStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed'

export type AlertType =
  | 'QR_ALREADY_CLAIMED'
  | 'GEO_FENCE_VIOLATION'
  | 'DUPLICATE_SCAN'
  | 'SUSPICIOUS_FREQUENCY'
  | 'UNAUTHORIZED_DEVICE'

export interface SecurityAlertPartnerRef {
  id: string
  referenceId?: string
  businessName: string
  ownerName: string
  type: string
  region: string
}

export interface SecurityAlertBusinessDetails {
  businessName: string
  partnerName: string
  outletName: string
  outletUserName?: string | null
}

export interface SecurityAlertProductDetails {
  productName: string
  productCode: string
  categoryName?: string | null
}

export interface SecurityAlertProductUpload {
  uploadBatchId: string
  batchNo: string
  productionPlanNumber: string
}

export interface SecurityAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  reason: string
  scannedCode: string
  packagingLevel: string
  serial: number
  batch: string
  businessDetails: SecurityAlertBusinessDetails
  productDetails: SecurityAlertProductDetails
  productUpload: SecurityAlertProductUpload
  scanPartnerDetails: SecurityAlertPartnerRef
  affectedPartnerDetails: SecurityAlertPartnerRef
  affectedPartnerRewardPoints: number
  reviewedBy: string | null
  reviewedAt: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
}

export interface SecurityAlertDetail extends SecurityAlert {
  productId: string
  productUploadId: string
  businessId: string
  technicalInformation: {
    sourceIp: string
    deviceInfo: string
    deviceUuid: string
    appVersion: string
  }
}
