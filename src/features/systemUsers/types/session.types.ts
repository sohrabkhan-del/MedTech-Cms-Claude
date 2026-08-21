export interface UserSession {
  id: string
  userId: string
  userType: string
  sessionId: string
  accessJti: string
  refreshJti: string
  deviceId: string
  platform: string
  appVersion: string
  userAgent: string
  ipAddress: string
  status: 'ACTIVE' | 'LOGGED_OUT' | 'REVOKED' | string
  issuedAt: string
  lastSeenAt: string
  expiresAt: string
  revokedAt: string | null
  revokedReason: string
  isCurrent: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}
