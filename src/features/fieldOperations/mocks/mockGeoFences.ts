import type {
  GeoFence,
  GeoFenceAuditEntry,
  GeoFenceScanEntry,
  GeoFenceStatus,
  GeoFenceTimelineEntry,
  GeoFenceUserType,
  GeoFenceVerificationEntry,
} from '@/types/geoFence'
import type { PartnerZone } from '@/types/partner'
import { mockDealers } from '@/features/userManagement/mockDealers'
import { mockChemists } from '@/features/userManagement/mockChemists'
import { mrs } from '@/features/userManagement/mockPartnerData'

const zones: PartnerZone[] = ['North', 'South', 'East', 'West']
const statuses: GeoFenceStatus[] = ['active', 'active', 'active', 'pending', 'inactive']
const verifiers = ['Rohan Kapoor', 'Neha Joshi', 'Sanjay Iyer', 'Kavita Reddy', 'Admin']

interface FenceUser {
  id: string
  name: string
  businessName: string
  businessAddress: string
  userType: GeoFenceUserType
  linkedUserId?: string
  latitude: number
  longitude: number
  radius: number
  buffer: number
  zone: PartnerZone
  lastVerifiedDate: string
}

const fenceUsers: FenceUser[] = [
  ...mockDealers.map((dealer) => ({
    id: dealer.id,
    name: dealer.ownerName,
    businessName: dealer.shopName,
    businessAddress: dealer.registeredAddress,
    userType: 'Dealer' as const,
    linkedUserId: dealer.id,
    latitude: dealer.geoLock.latitude,
    longitude: dealer.geoLock.longitude,
    radius: dealer.geoLock.allowedRadiusMeters,
    buffer: dealer.geoLock.bufferRadiusMeters,
    zone: dealer.zone,
    lastVerifiedDate: dealer.geoLock.lastVerifiedDate,
  })),
  ...mockChemists.map((chemist) => ({
    id: chemist.id,
    name: chemist.ownerName,
    businessName: chemist.shopName,
    businessAddress: chemist.registeredAddress,
    userType: 'Chemist' as const,
    linkedUserId: chemist.id,
    latitude: chemist.geoLock.latitude,
    longitude: chemist.geoLock.longitude,
    radius: chemist.geoLock.allowedRadiusMeters,
    buffer: chemist.geoLock.bufferRadiusMeters,
    zone: chemist.zone,
    lastVerifiedDate: chemist.geoLock.lastVerifiedDate,
  })),
  ...mrs.map((mr, index) => ({
    id: `mr-${index + 1}`,
    name: mr,
    businessName: 'Field Operations',
    businessAddress: 'Not applicable',
    userType: 'MR' as const,
    latitude: 19 + ((index * 37) % 900) / 100,
    longitude: 72 + ((index * 53) % 900) / 100,
    radius: [100, 150, 200][index % 3]!,
    buffer: [50, 75][index % 2]!,
    zone: zones[index % zones.length]!,
    lastVerifiedDate: `${((index * 5) % 27) + 1} Jul 2026`,
  })),
]

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function buildVerificationHistory(seed: number, currentRadius: number): GeoFenceVerificationEntry[] {
  return Array.from({ length: 3 }).map((_, i) => {
    const previousRadius = [100, 150, 200, 250][(seed + i) % 4]!
    return {
      id: `${seed}-verify-${i}`,
      date: `${((seed + i * 3) % 27) + 1} Jun 2026`,
      verifiedBy: verifiers[(seed + i) % verifiers.length]!,
      previousRadiusMeters: previousRadius,
      newRadiusMeters: i === 2 ? currentRadius : previousRadius,
      remarks: i === 2 ? 'Radius adjusted after field verification.' : 'Routine verification completed.',
    }
  })
}

function buildScanHistory(seed: number, userName: string): GeoFenceScanEntry[] {
  return Array.from({ length: 5 }).map((_, i) => {
    const distance = seededNumber(seed + i, 5, 400)
    const withinFence = distance < 250
    return {
      id: `${seed}-scan-${i}`,
      scanDate: `${((seed + i) % 27) + 1} Jul 2026`,
      user: userName,
      location: withinFence ? 'Within registered fence' : 'Outside registered fence',
      distanceMeters: distance,
      result: withinFence ? 'valid' : 'invalid',
      status: withinFence ? 'within_fence' : 'outside_fence',
    }
  })
}

function buildTimeline(seed: number, status: GeoFenceStatus): GeoFenceTimelineEntry[] {
  const timeline: GeoFenceTimelineEntry[] = [
    { id: `${seed}-tl-0`, activity: 'Geo Fence Created', dateTime: `${((seed % 27) + 1)} Jan 2026, 10:00` },
    { id: `${seed}-tl-1`, activity: 'Radius Updated', dateTime: `${((seed % 27) + 1)} Apr 2026, 11:30` },
    { id: `${seed}-tl-2`, activity: 'Verification Completed', dateTime: `${((seed % 27) + 1)} Jun 2026, 09:15` },
  ]
  timeline.push(
    status === 'inactive'
      ? { id: `${seed}-tl-3`, activity: 'Deactivated', dateTime: `${((seed % 27) + 1)} Jul 2026, 14:00` }
      : { id: `${seed}-tl-3`, activity: 'Activated', dateTime: `${((seed % 27) + 1)} Jul 2026, 14:00` },
  )
  return timeline
}

function buildAuditHistory(seed: number): GeoFenceAuditEntry[] {
  return Array.from({ length: 3 }).map((_, i) => ({
    id: `${seed}-audit-${i}`,
    date: `${((seed + i) % 27) + 1} Jul 2026`,
    action: ['Fence Created', 'Radius Updated', 'Status Changed'][i]!,
    performedBy: verifiers[(seed + i) % verifiers.length]!,
    remarks: ['Initial setup during onboarding.', 'Radius widened after complaint.', 'Reviewed and confirmed active.'][i]!,
  }))
}

function buildFence(seed: number): GeoFence {
  const user = fenceUsers[(seed - 1) % fenceUsers.length]!
  const status = statuses[seed % statuses.length]!

  return {
    id: `fence-${seed}`,
    userName: user.name,
    businessName: user.businessName,
    businessAddress: user.businessAddress,
    userType: user.userType,
    linkedUserId: user.linkedUserId,
    region: user.zone,
    zone: user.zone,
    latitude: user.latitude,
    longitude: user.longitude,
    radiusMeters: user.radius,
    bufferDistanceMeters: user.buffer,
    lastVerified: user.lastVerifiedDate,
    status,
    verificationHistory: buildVerificationHistory(seed, user.radius),
    scanHistory: buildScanHistory(seed, user.name),
    timeline: buildTimeline(seed, status),
    auditHistory: buildAuditHistory(seed),
  }
}

export const mockGeoFences: GeoFence[] = fenceUsers.map((_, index) => buildFence(index + 1))

export function getGeoFenceById(id: string): GeoFence | undefined {
  return mockGeoFences.find((fence) => fence.id === id)
}

export const geoFenceUserOptions = fenceUsers.map((user) => ({ id: user.id, name: user.name, userType: user.userType }))

export const geoFenceKpis = {
  activeFences: mockGeoFences.filter((fence) => fence.status === 'active').length,
  pendingVerification: mockGeoFences.filter((fence) => fence.status === 'pending').length,
  averageRadius: Math.round(mockGeoFences.reduce((sum, fence) => sum + fence.radiusMeters, 0) / mockGeoFences.length),
  verifiedThisWeek: mockGeoFences.filter((fence) => fence.lastVerified.includes('Jul 2026')).length,
}
