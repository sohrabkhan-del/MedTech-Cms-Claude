import type { ScanEvent, ScanResult, ScanUserRole, ScanUserSummary } from '@/types/scanFeed'
import type { PartnerBase } from '@/types/partner'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'

const productNames = ['CardioCare 10mg', 'NeuroPlus 500mg', 'ImmunoBoost Syrup', 'GlucoBalance', 'PainRelief Gel']
const productCodes = ['S0H6-2', 'S0H6-1', 'CU82-S0H6-5-1', 'CU82-S0H6-5-2', 'S0H4-1']
const devices = ['Android 14 / Chrome 128', 'iOS 18 / Safari 18', 'Android 13 / MedTech App 4.2', 'iOS 17 / MedTech App 4.2']
const results: ScanResult[] = [
  'success',
  'success',
  'success',
  'success',
  'failed_outside_geofence',
  'failed_duplicate_scan',
  'failed_invalid_code',
]

interface ScanUser {
  id: string
  name: string
  role: ScanUserRole
  businessName: string
  partner: PartnerBase
}

const scanUsers: ScanUser[] = [
  ...mockDealers.map((dealer) => ({ id: dealer.id, name: dealer.ownerName, role: 'Dealer' as const, businessName: dealer.shopName, partner: dealer })),
  ...mockChemists.map((chemist) => ({ id: chemist.id, name: chemist.ownerName, role: 'Chemist' as const, businessName: chemist.shopName, partner: chemist })),
]

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function scanDateTime(seed: number): string {
  const day = (seed % 14) + 1
  const hour = seed % 24
  const minute = (seed * 7) % 60
  return `${pad(day)} Jul 2026, ${pad(hour)}:${pad(minute)}`
}

function isSuccess(result: ScanResult): boolean {
  return result === 'success'
}

function buildScanCode(seed: number, productCode: string): string {
  const yearMonth = `25${pad(((seed % 12) + 1))}`
  const sequence = String((seed * 37) % 100000).padStart(5, '0')
  const suffix = String(100000 + ((seed * 6151) % 900000))
  return `${productCode}-${yearMonth}-${sequence}_${suffix}`
}

function buildScanEvent(seed: number): ScanEvent {
  const user = scanUsers[seed % scanUsers.length]!
  const result = results[seed % results.length]!
  const success = isSuccess(result)
  const productCode = productCodes[seed % productCodes.length]!

  return {
    id: `scan-${seed}`,
    scanDateTime: scanDateTime(seed),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    businessName: user.businessName,
    scanCode: buildScanCode(seed, productCode),
    productName: productNames[seed % productNames.length]!,
    productCode,
    batchNumber: `BATCH-${2026000 + seed * 3}`,
    region: user.partner.zone,
    result,
    rewardPoints: success ? seededNumber(seed, 10, 60) : 0,
    validation: {
      codeValidation: result === 'failed_invalid_code' ? 'failed' : 'passed',
      duplicateScanCheck: result === 'failed_duplicate_scan' ? 'failed' : 'passed',
      geoFenceValidation: result === 'failed_outside_geofence' ? 'failed' : 'passed',
      productEligibility: 'passed',
      rewardEligibility: success ? 'passed' : 'failed',
    },
    location: {
      latitude: user.partner.geoLock.latitude,
      longitude: user.partner.geoLock.longitude,
      registeredGeoFenceRadiusMeters: user.partner.geoLock.allowedRadiusMeters,
      distanceFromRegisteredMeters: result === 'failed_outside_geofence' ? seededNumber(seed, 300, 900) : seededNumber(seed, 5, 80),
      geoFenceValidationResult: result === 'failed_outside_geofence' ? 'outside_range' : 'within_range',
    },
    technical: {
      sourceIp: `103.${seed % 255}.${(seed * 3) % 255}.${(seed * 7) % 255}`,
      deviceInfo: devices[seed % devices.length]!,
      appVersion: '4.2.1',
    },
  }
}

export const mockScanEvents: ScanEvent[] = Array.from({ length: 160 }).map((_, index) => buildScanEvent(index + 1))

let liveScanCounter = mockScanEvents.length

const MAX_TRACKED_LIVE_EVENTS = 200
const liveScanEvents = new Map<string, ScanEvent>()

/** Generates one synthetic scan event for the live feed, distinct from the seeded mock history. */
export function generateLiveScanEvent(): ScanEvent {
  liveScanCounter += 1
  const seed = liveScanCounter
  const user = scanUsers[Math.floor(Math.random() * scanUsers.length)]!
  const result = results[Math.floor(Math.random() * results.length)]!
  const success = isSuccess(result)
  const now = new Date()
  const scanDateTimeLabel = `${pad(now.getDate())} Jul 2026, ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const productCode = productCodes[seed % productCodes.length]!

  const scanEvent: ScanEvent = {
    id: `scan-live-${seed}`,
    scanDateTime: scanDateTimeLabel,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    businessName: user.businessName,
    scanCode: buildScanCode(seed, productCode),
    productName: productNames[seed % productNames.length]!,
    productCode,
    batchNumber: `BATCH-${2026000 + seed * 3}`,
    region: user.partner.zone,
    result,
    rewardPoints: success ? seededNumber(seed, 10, 60) : 0,
    validation: {
      codeValidation: result === 'failed_invalid_code' ? 'failed' : 'passed',
      duplicateScanCheck: result === 'failed_duplicate_scan' ? 'failed' : 'passed',
      geoFenceValidation: result === 'failed_outside_geofence' ? 'failed' : 'passed',
      productEligibility: 'passed',
      rewardEligibility: success ? 'passed' : 'failed',
    },
    location: {
      latitude: user.partner.geoLock.latitude,
      longitude: user.partner.geoLock.longitude,
      registeredGeoFenceRadiusMeters: user.partner.geoLock.allowedRadiusMeters,
      distanceFromRegisteredMeters: result === 'failed_outside_geofence' ? seededNumber(seed, 300, 900) : seededNumber(seed, 5, 80),
      geoFenceValidationResult: result === 'failed_outside_geofence' ? 'outside_range' : 'within_range',
    },
    technical: {
      sourceIp: `103.${seed % 255}.${(seed * 3) % 255}.${(seed * 7) % 255}`,
      deviceInfo: devices[seed % devices.length]!,
      appVersion: '4.2.1',
    },
  }

  liveScanEvents.set(scanEvent.id, scanEvent)
  if (liveScanEvents.size > MAX_TRACKED_LIVE_EVENTS) {
    const oldestKey = liveScanEvents.keys().next().value
    if (oldestKey) liveScanEvents.delete(oldestKey)
  }

  return scanEvent
}

export function getScanEventById(id: string): ScanEvent | undefined {
  return mockScanEvents.find((scan) => scan.id === id) ?? liveScanEvents.get(id)
}

function getUserGodowns(user: ScanUser): string[] {
  const sameRolePeers = scanUsers.filter((u) => u.role === user.role)
  const userIndex = sameRolePeers.findIndex((u) => u.id === user.id)
  const godownCount = (userIndex % 3) + 1

  return Array.from({ length: godownCount }).map((_, i) => {
    if (i === 0) return user.businessName
    const peer = sameRolePeers[(userIndex + i * 7) % sameRolePeers.length]!
    return peer.businessName
  })
}

export function getUserScanSummary(userId: string): ScanUserSummary | undefined {
  const user = scanUsers.find((u) => u.id === userId)
  if (!user) return undefined

  const userScans = mockScanEvents.filter((scan) => scan.userId === userId)
  const successfulScans = userScans.filter((scan) => isSuccess(scan.result)).length

  return {
    userId: user.id,
    userName: user.name,
    role: user.role,
    contactNumber: user.partner.phone,
    email: user.partner.email,
    city: user.partner.city,
    address: user.partner.registeredAddress,
    zone: user.partner.zone,
    businessName: user.businessName,
    businessNames: getUserGodowns(user),
    status: user.partner.status === 'inactive' ? 'inactive' : 'active',
    lastScanDateTime: userScans[0]?.scanDateTime ?? '—',
    totalScans: userScans.length,
    successfulScans,
    failedScans: userScans.length - successfulScans,
    totalPointsEarned: userScans.reduce((sum, scan) => sum + scan.rewardPoints, 0),
  }
}

export function getUserScanHistory(userId: string): ScanEvent[] {
  return mockScanEvents.filter((scan) => scan.userId === userId)
}

export const scanFeedKpis = {
  totalScans: mockScanEvents.length,
  successfulScans: mockScanEvents.filter((scan) => isSuccess(scan.result)).length,
  failedScans: mockScanEvents.filter((scan) => !isSuccess(scan.result)).length,
  geoFenceViolations: mockScanEvents.filter((scan) => scan.result === 'failed_outside_geofence').length,
}
