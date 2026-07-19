import type { ScanReportEntry, ScanReportResult, ScanReportTimelineEntry, ScanReportWalletStatus } from '@/types/scanReport'
import { mockProducts } from '@/features/inventory/mockProducts'
import { mockDealers } from '@/features/dealers/mockDealers'
import { mockChemists } from '@/features/chemists/mockChemists'

const devices = ['Android App v4.2', 'iOS App v4.2', 'Android App v4.1', 'Web Scanner Portal']
const schemeNames = ['Seasonal Booster 2026', 'General Reward Scheme', 'Gift Rule Bonus', 'Volume Booster Scheme']
const locations = [
  { name: 'Delhi', latitude: 28.6139, longitude: 77.209 },
  { name: 'Mumbai', latitude: 19.076, longitude: 72.8777 },
  { name: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
  { name: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Lucknow', latitude: 26.8467, longitude: 80.9462 },
  { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Hyderabad', latitude: 17.385, longitude: 78.4867 },
]

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateTimeFromSeed(seed: number, month = 'Jul'): string {
  const day = (seed % 27) + 1
  const hour = 8 + (seed % 10)
  const minute = (seed * 7) % 60
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour > 12 ? hour - 12 : hour
  return `${pad(day)} ${month} 2026, ${hour12}:${pad(minute)} ${ampm}`
}

function resolveScanResult(seed: number): ScanReportResult {
  const mod = seed % 10
  if (mod === 9) return 'invalid'
  if (mod === 7 || mod === 8) return 'duplicate'
  return 'valid'
}

function resolveWalletStatus(scanResult: ScanReportResult, seed: number): ScanReportWalletStatus {
  if (scanResult !== 'valid') return 'failed'
  return seed % 8 === 0 ? 'pending' : 'credited'
}

function jitter(value: number, seed: number, precision: number): number {
  const delta = (seededNumber(seed, 0, 200) - 100) / 10000
  return Number((value + delta).toFixed(precision))
}

function buildTimeline(seed: number, entryId: string, scanResult: ScanReportResult, walletStatus: ScanReportWalletStatus): ScanReportTimelineEntry[] {
  const timeline: ScanReportTimelineEntry[] = [
    { id: `${entryId}-tl-0`, activity: 'Barcode Scanned', dateTime: dateTimeFromSeed(seed) },
  ]
  if (scanResult === 'valid') {
    timeline.push({ id: `${entryId}-tl-1`, activity: 'Scan Validated', dateTime: dateTimeFromSeed(seed + 1) })
    timeline.push({ id: `${entryId}-tl-2`, activity: 'Reward Calculated', dateTime: dateTimeFromSeed(seed + 2) })
    if (walletStatus === 'credited') {
      timeline.push({ id: `${entryId}-tl-3`, activity: 'Wallet Credited', dateTime: dateTimeFromSeed(seed + 3) })
    } else if (walletStatus === 'failed') {
      timeline.push({ id: `${entryId}-tl-3`, activity: 'Wallet Credit Failed', dateTime: dateTimeFromSeed(seed + 3) })
    }
  } else if (scanResult === 'duplicate') {
    timeline.push({ id: `${entryId}-tl-1`, activity: 'Duplicate Scan Detected', dateTime: dateTimeFromSeed(seed + 1) })
  } else {
    timeline.push({ id: `${entryId}-tl-1`, activity: 'Invalid Barcode Flagged', dateTime: dateTimeFromSeed(seed + 1) })
  }
  return timeline
}

function buildScanReport(index: number): ScanReportEntry {
  const seed = index + 1
  const id = `RPT-SCAN-${100000 + index}`
  const product = mockProducts[index % mockProducts.length]!
  const batchNumber = `BATCH-${2026000 + Math.floor(index / 3) * 3}`

  const hasDealer = seed % 3 !== 1
  const hasChemist = !hasDealer || seed % 5 === 0
  const dealer = hasDealer ? mockDealers[seed % mockDealers.length] : undefined
  const chemist = hasChemist ? mockChemists[seed % mockChemists.length] : undefined

  const scanResult = resolveScanResult(seed)
  const walletStatus = resolveWalletStatus(scanResult, seed)
  const baseRewardPoints = scanResult === 'valid' ? seededNumber(seed, 10, 40) : 0
  const bonusPoints = scanResult === 'valid' && seed % 4 === 0 ? seededNumber(seed + 1, 5, 20) : 0
  const rewardPoints = baseRewardPoints + bonusPoints
  const location = locations[seed % locations.length]!

  return {
    id,
    scanDateTime: dateTimeFromSeed(seed + 10),
    barcodeNumber: `BC-${400000 + seed * 13}`,

    productId: product.id,
    productName: product.productName,
    productCode: product.productCode,
    productCategory: product.productCategory,
    batchNumber,

    dealerId: dealer?.id,
    dealerName: dealer?.shopName,
    chemistId: chemist?.id,
    chemistName: chemist?.shopName,

    scanResult,
    device: devices[seed % devices.length]!,
    ipAddress: `192.168.${seed % 255}.${(seed * 5) % 255}`,

    locationName: location.name,
    latitude: jitter(location.latitude, seed, 4),
    longitude: jitter(location.longitude, seed + 1, 4),

    baseRewardPoints,
    bonusPoints,
    rewardPoints,
    appliedScheme: scanResult === 'valid' ? schemeNames[seed % schemeNames.length]! : '—',
    walletStatus,
    walletTransactionId: walletStatus === 'credited' ? `WTX-${900000 + seed * 3}` : undefined,

    timeline: buildTimeline(seed, id, scanResult, walletStatus),
  }
}

export const mockScanReports: ScanReportEntry[] = Array.from({ length: 60 }).map((_, index) => buildScanReport(index))

export function getScanReportById(id: string): ScanReportEntry | undefined {
  return mockScanReports.find((entry) => entry.id === id)
}

export const scanReportKpis = {
  totalScans: mockScanReports.length,
  successfulScans: mockScanReports.filter((s) => s.scanResult === 'valid').length,
  failedScans: mockScanReports.filter((s) => s.scanResult === 'duplicate' || s.scanResult === 'invalid').length,
  rewardPointsIssued: mockScanReports.reduce((sum, s) => sum + s.rewardPoints, 0),
}

export const scanReportProductOptions = Array.from(new Set(mockScanReports.map((s) => s.productName))).sort()
export const scanReportDealerOptions = Array.from(new Set(mockScanReports.filter((s) => s.dealerName).map((s) => s.dealerName!))).sort()
export const scanReportChemistOptions = Array.from(new Set(mockScanReports.filter((s) => s.chemistName).map((s) => s.chemistName!))).sort()
