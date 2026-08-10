export type ScanUserRole = 'Dealer' | 'Chemist'

export type ScanStatus = 'success' | 'failed'

export interface ScanBusinessDetails {
  businessName: string
  partnerName: string
  outletName: string
  outletUserName?: string | null
}

export interface ScanProductDetails {
  productCode: string
  productCategory?: string | null
}

export interface ScanTechnicalInfo {
  sourceIp: string
  deviceInfo: string
  deviceUuid: string
  scanTimestamp: string
  appVersion: string
}

export interface ScanEvent {
  id: string
  referenceId: string
  businessDetails: ScanBusinessDetails
  partnerType: string
  scannedAt: string
  scanResult: string
  scanResultType: string
  scanStatus: ScanStatus
  scannedCode: string
  productDetails: ScanProductDetails
  region: string
  batchNo: string
  rewardPointsEarned: number
}

export interface ScanEventDetail extends ScanEvent {
  latitude: number
  longitude: number
  geofenceAllowed: number
  bufferGeofenceAllowed: number
  distanceFromTaggedLocation: number
  technicalInformation: ScanTechnicalInfo
  rewardReason?: string | null
  productId: string
  productUploadId: string
  partnerId: string
  businessId: string
  createdAt: string
  updatedAt: string
}
