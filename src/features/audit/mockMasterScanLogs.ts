import type {
  AuditTimelineEntry,
  MasterScanLogEntry,
  OwnershipTimelineEntry,
  ScanHistoryEntry,
  ScanStatus,
  WalletStatus,
} from '@/types/masterScanLog'
import { mockProducts } from '@/features/inventory/mockProducts'

const distributors = ['Apex Distribution', 'Meridian Supply Co.', 'Vantage Logistics', 'Prime Channel Partners', 'Horizon Distributors']
const dealers = ['Om Medical Godown', 'Sunrise Pharma Godown', 'Care Plus Godown', 'Wellness Godown', 'City Drug Godown']
const chemists = ['Apollo Pharma Chemist', 'Sri Sai Medical', 'National Chemist', 'Metro Chemist', 'United Pharma Chemist']
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Bengaluru', 'Hyderabad']
const devices = ['Android App v4.2', 'iOS App v4.2', 'Android App v4.1', 'Web Scanner Portal']
const schemeNames = ['Seasonal Booster 2026', 'General Reward Scheme', 'Gift Rule Bonus', 'Volume Booster Scheme']

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

function resolveScanResult(seed: number): ScanStatus {
  const mod = seed % 10
  if (mod === 9) return 'invalid'
  if (mod === 7 || mod === 8) return 'duplicate'
  return 'valid'
}

function resolveWalletStatus(scanResult: ScanStatus, seed: number): WalletStatus {
  if (scanResult !== 'valid') return 'failed'
  return seed % 8 === 0 ? 'pending' : 'credited'
}

function buildScanHistory(seed: number, logId: string, primaryUser: string, userType: ScanHistoryEntry['userType'], primaryResult: ScanStatus, rewardPoints: number): ScanHistoryEntry[] {
  const count = seededNumber(seed, 1, 4)
  return Array.from({ length: count }).map((_, i) => {
    const isPrimary = i === 0
    const result = isPrimary ? primaryResult : resolveScanResult(seed + i * 3)
    return {
      id: `${logId}-scan-${i}`,
      scanDateTime: dateTimeFromSeed(seed - i * 2),
      userName: primaryUser,
      userType,
      scanResult: result,
      rewardPoints: isPrimary && result === 'valid' ? rewardPoints : 0,
      device: devices[(seed + i) % devices.length]!,
      ipAddress: `192.168.${(seed + i) % 255}.${(seed * 3 + i) % 255}`,
    }
  })
}

function buildOwnershipTimeline(seed: number, logId: string, dealer: string | undefined, chemist: string | undefined, walletStatus: WalletStatus): OwnershipTimelineEntry[] {
  const timeline: OwnershipTimelineEntry[] = [
    { id: `${logId}-own-0`, activity: 'Product Created', dateTime: dateTimeFromSeed(seed, 'May') },
    { id: `${logId}-own-1`, activity: 'Batch Generated', dateTime: dateTimeFromSeed(seed + 2, 'May') },
    { id: `${logId}-own-2`, activity: 'Assigned to Distributor', dateTime: dateTimeFromSeed(seed + 4, 'Jun') },
  ]
  if (dealer) {
    timeline.push({ id: `${logId}-own-3`, activity: 'Assigned to Dealer', dateTime: dateTimeFromSeed(seed + 6, 'Jun') })
  }
  if (chemist) {
    timeline.push({ id: `${logId}-own-4`, activity: 'Purchased by Chemist', dateTime: dateTimeFromSeed(seed + 8, 'Jun') })
  }
  timeline.push({ id: `${logId}-own-5`, activity: 'Barcode Scanned', dateTime: dateTimeFromSeed(seed + 10) })
  timeline.push({ id: `${logId}-own-6`, activity: 'Reward Calculated', dateTime: dateTimeFromSeed(seed + 10) })
  if (walletStatus === 'credited') {
    timeline.push({ id: `${logId}-own-7`, activity: 'Wallet Credited', dateTime: dateTimeFromSeed(seed + 11) })
  }
  return timeline
}

function buildAuditTimeline(seed: number, logId: string, dealer: string | undefined, chemist: string | undefined, scanResult: ScanStatus, walletStatus: WalletStatus): AuditTimelineEntry[] {
  const timeline: AuditTimelineEntry[] = [
    { id: `${logId}-audit-0`, activity: 'Product Created', dateTime: dateTimeFromSeed(seed, 'May') },
    { id: `${logId}-audit-1`, activity: 'Batch Generated', dateTime: dateTimeFromSeed(seed + 2, 'May') },
    { id: `${logId}-audit-2`, activity: 'Barcode Generated', dateTime: dateTimeFromSeed(seed + 3, 'May') },
    { id: `${logId}-audit-3`, activity: 'Distributor Assigned', dateTime: dateTimeFromSeed(seed + 4, 'Jun') },
  ]
  if (dealer) {
    timeline.push({ id: `${logId}-audit-4`, activity: 'Dealer Assigned', dateTime: dateTimeFromSeed(seed + 6, 'Jun') })
  }
  if (chemist) {
    timeline.push({ id: `${logId}-audit-5`, activity: 'Chemist Purchase', dateTime: dateTimeFromSeed(seed + 8, 'Jun') })
  }
  timeline.push({ id: `${logId}-audit-6`, activity: 'Barcode Scanned', dateTime: dateTimeFromSeed(seed + 10) })
  if (scanResult === 'valid') {
    timeline.push({ id: `${logId}-audit-7`, activity: 'Reward Calculated', dateTime: dateTimeFromSeed(seed + 10) })
  }
  if (walletStatus === 'credited') {
    timeline.push({ id: `${logId}-audit-8`, activity: 'Wallet Credited', dateTime: dateTimeFromSeed(seed + 11) })
  }
  if (scanResult === 'duplicate' || scanResult === 'invalid') {
    timeline.push({ id: `${logId}-audit-9`, activity: 'Security Alert Generated', dateTime: dateTimeFromSeed(seed + 11), flagged: true })
  }
  return timeline
}

function buildLog(index: number): MasterScanLogEntry {
  const seed = index + 1
  const product = mockProducts[index % mockProducts.length]!
  const id = `SCAN-${100000 + index}`
  const batchNumber = `BATCH-${2026000 + Math.floor(index / 3) * 3}`
  const distributor = distributors[seed % distributors.length]!
  const hasDealer = seed % 3 !== 1
  const hasChemist = !hasDealer || seed % 5 === 0
  const dealer = hasDealer ? dealers[seed % dealers.length] : undefined
  const chemist = hasChemist ? chemists[seed % chemists.length] : undefined
  const primaryUser = chemist ?? dealer ?? distributor
  const primaryUserType: ScanHistoryEntry['userType'] = chemist ? 'Chemist' : dealer ? 'Dealer' : 'Distributor'

  const scanResult = resolveScanResult(seed)
  const walletStatus = resolveWalletStatus(scanResult, seed)
  const baseRewardPoints = scanResult === 'valid' ? seededNumber(seed, 10, 40) : 0
  const bonusPoints = scanResult === 'valid' && seed % 4 === 0 ? seededNumber(seed + 1, 5, 20) : 0
  const totalRewardPoints = baseRewardPoints + bonusPoints

  return {
    id,
    productCode: product.productCode,
    productName: product.productName,
    productCategory: product.productCategory,
    batchNumber,
    manufacturingDate: dateTimeFromSeed(seed, 'May').split(',')[0]!,
    expiryDate: `${pad((seed % 27) + 1)} May 2028`,
    barcodeNumber: `BC-${400000 + seed * 13}`,

    distributor,
    dealer,
    chemist,

    scanDateTime: dateTimeFromSeed(seed + 10),
    scanLocation: cities[seed % cities.length]!,
    scanResult,
    device: devices[seed % devices.length]!,
    ipAddress: `192.168.${seed % 255}.${(seed * 5) % 255}`,

    baseRewardPoints,
    appliedScheme: scanResult === 'valid' ? schemeNames[seed % schemeNames.length]! : '—',
    bonusPoints,
    totalRewardPoints,
    walletStatus,
    walletTransactionId: walletStatus === 'credited' ? `WTX-${900000 + seed * 3}` : undefined,

    scanHistory: buildScanHistory(seed, id, primaryUser, primaryUserType, scanResult, totalRewardPoints),
    ownershipTimeline: buildOwnershipTimeline(seed, id, dealer, chemist, walletStatus),
    auditTimeline: buildAuditTimeline(seed, id, dealer, chemist, scanResult, walletStatus),
  }
}

export const mockMasterScanLogs: MasterScanLogEntry[] = Array.from({ length: 60 }).map((_, index) => buildLog(index))

export function getMasterScanLogById(id: string): MasterScanLogEntry | undefined {
  return mockMasterScanLogs.find((log) => log.id === id)
}

export const masterScanLogKpis = {
  totalProducts: new Set(mockMasterScanLogs.map((l) => l.productCode)).size,
  totalBatches: new Set(mockMasterScanLogs.map((l) => l.batchNumber)).size,
  totalBarcodeScans: mockMasterScanLogs.length,
  successfulScans: mockMasterScanLogs.filter((l) => l.scanResult === 'valid').length,
  rewardPointsIssued: mockMasterScanLogs.reduce((sum, l) => sum + l.totalRewardPoints, 0),
}

export const distributorOptions = distributors
export const dealerOptions = dealers
export const chemistOptions = chemists
export const batchOptions = Array.from(new Set(mockMasterScanLogs.map((l) => l.batchNumber))).sort()
export const productOptions = Array.from(new Set(mockMasterScanLogs.map((l) => l.productName))).sort()
