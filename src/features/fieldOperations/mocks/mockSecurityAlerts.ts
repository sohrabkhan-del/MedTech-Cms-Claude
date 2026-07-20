import type { AlertSeverity, AlertType, SecurityAlert, SecurityTimelineEntry, UserSecuritySummary } from '@/types/securityAlert'
import { mockDealers } from '@/features/dealers/mockDealers'
import { mockChemists } from '@/features/chemists/mockChemists'

const alertTypes: AlertType[] = [
  'Duplicate Barcode Scan',
  'Geo-fence Violation',
  'Multiple Failed Scan Attempts',
  'Unauthorized Device Login',
  'Suspicious Scan Frequency',
]

const alertDescriptions: Record<AlertType, string> = {
  'Duplicate Barcode Scan': 'The same barcode was scanned more than once within a short window.',
  'Geo-fence Violation': 'A scan was performed outside the registered geo-fence boundary.',
  'Multiple Failed Scan Attempts': 'Several consecutive scan attempts failed validation.',
  'Unauthorized Device Login': 'Account was accessed from an unrecognized device.',
  'Suspicious Scan Frequency': 'Scan frequency significantly exceeded normal usage patterns.',
}

const severities: AlertSeverity[] = ['high', 'high', 'medium', 'medium', 'low']
const requestSources = ['Mobile App', 'Web Portal', 'API']
const devices = ['Android 14 / Chrome 128', 'iOS 18 / Safari 18', 'Android 13 / MedTech App 4.2', 'iOS 17 / MedTech App 4.2']

const alertUsers = [
  ...mockDealers.map((dealer) => ({ id: dealer.id, name: dealer.ownerName, role: 'Dealer' as const, partner: dealer })),
  ...mockChemists.map((chemist) => ({ id: chemist.id, name: chemist.ownerName, role: 'Chemist' as const, partner: chemist })),
]

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function alertDateTime(seed: number): string {
  const day = (seed % 14) + 1
  const hour = seed % 24
  const minute = (seed * 5) % 60
  return `${pad(day)} Jul 2026, ${pad(hour)}:${pad(minute)}`
}

function buildAlert(seed: number): SecurityAlert {
  const user = alertUsers[seed % alertUsers.length]!
  const alertType = alertTypes[seed % alertTypes.length]!

  return {
    id: `alert-${seed}`,
    alertType,
    description: alertDescriptions[alertType],
    affectedUserId: user.id,
    affectedUserName: user.name,
    userType: user.role,
    requestSource: requestSources[seed % requestSources.length]!,
    severity: severities[seed % severities.length]!,
    alertDateTime: alertDateTime(seed),
    sourceIp: `103.${seed % 255}.${(seed * 3) % 255}.${(seed * 7) % 255}`,
    userStatus: user.partner.status === 'inactive' ? 'inactive' : 'active',
  }
}

export const mockSecurityAlerts: SecurityAlert[] = Array.from({ length: 64 }).map((_, index) => buildAlert(index + 1))

export function getSecurityAlertById(id: string): SecurityAlert | undefined {
  return mockSecurityAlerts.find((alert) => alert.id === id)
}

export function getUserSecuritySummary(userId: string): UserSecuritySummary | undefined {
  const user = alertUsers.find((u) => u.id === userId)
  if (!user) return undefined

  const userAlerts = mockSecurityAlerts.filter((alert) => alert.affectedUserId === userId)
  const highSeverityAlerts = userAlerts.filter((alert) => alert.severity === 'high').length

  return {
    userId: user.id,
    userName: user.name,
    userType: user.role,
    mobileNumber: user.partner.phone,
    email: user.partner.email,
    region: user.partner.zone,
    status: user.partner.status === 'inactive' ? 'inactive' : 'active',
    totalAlerts: userAlerts.length,
    highSeverityAlerts,
    lastAlertDate: userAlerts[0]?.alertDateTime ?? '—',
    lastKnownLocation: user.partner.registeredAddress,
    sourceIp: userAlerts[0]?.sourceIp ?? '—',
    deviceInfo: devices[seededNumber(userId.length + user.id.length, 0, devices.length)]!,
    registeredDevice: devices[0]!,
  }
}

export function getUserAlertHistory(userId: string): SecurityAlert[] {
  return mockSecurityAlerts.filter((alert) => alert.affectedUserId === userId)
}

export function getUserSecurityTimeline(userId: string): SecurityTimelineEntry[] {
  const alerts = getUserAlertHistory(userId)
  const timeline: SecurityTimelineEntry[] = alerts.map((alert, i) => ({
    id: `${userId}-timeline-${i}`,
    activity: alert.alertType,
    dateTime: alert.alertDateTime,
  }))

  const user = alertUsers.find((u) => u.id === userId)
  if (user && user.partner.status === 'inactive') {
    timeline.push({ id: `${userId}-timeline-deactivated`, activity: 'Account Deactivated', dateTime: alerts[0]?.alertDateTime ?? '—' })
  } else {
    timeline.push({ id: `${userId}-timeline-activated`, activity: 'Account Activated', dateTime: alerts[alerts.length - 1]?.alertDateTime ?? '—' })
  }

  return timeline
}

export const securityAlertKpis = {
  totalAlerts: mockSecurityAlerts.length,
  highSeverity: mockSecurityAlerts.filter((alert) => alert.severity === 'high').length,
  mediumSeverity: mockSecurityAlerts.filter((alert) => alert.severity === 'medium').length,
  lowSeverity: mockSecurityAlerts.filter((alert) => alert.severity === 'low').length,
}
