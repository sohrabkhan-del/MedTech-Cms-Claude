import type {
  GeoLockDetails,
  InterestedProductEntry,
  LicenseDocument,
  PartnerBase,
  PartnerStatus,
  PartnerZone,
  PointsHistoryEntry,
  ScanHistoryEntry,
} from '@/types/partner'

const zones: PartnerZone[] = ['North', 'South', 'East', 'West']
const statuses: PartnerStatus[] = ['active', 'pending', 'inactive']
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Bengaluru', 'Hyderabad']
const owners = ['Rahul Mehta', 'Priya Nair', 'Amit Verma', 'Sunita Rao', 'Vikram Singh']
const mrs = ['Rohan Kapoor', 'Neha Joshi', 'Sanjay Iyer', 'Kavita Reddy']
const productNames = ['CardioCare 10mg', 'NeuroPlus 500mg', 'ImmunoBoost Syrup', 'GlucoBalance', 'PainRelief Gel']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function buildGeoLock(seed: number): GeoLockDetails {
  return {
    active: seed % 4 !== 0,
    latitude: 19 + seededNumber(seed, 0, 900) / 100,
    longitude: 72 + seededNumber(seed * 3, 0, 900) / 100,
    allowedRadiusMeters: [100, 150, 200, 250][seed % 4]!,
    lastVerifiedDate: `${(seed % 27) + 1} Jul 2026`,
    bufferRadiusMeters: [50, 75, 100][seed % 3]!,
  }
}

function buildScanHistory(seed: number, shopName: string): ScanHistoryEntry[] {
  const results: ScanHistoryEntry['result'][] = ['valid', 'valid', 'valid', 'duplicate', 'invalid']
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `${shopName}-scan-${i}`,
    scanDate: `${((seed + i) % 27) + 1} Jul 2026`,
    barcodeNumber: `BC-${100000 + seed * 7 + i}`,
    productName: productNames[(seed + i) % productNames.length]!,
    rewardPoints: seededNumber(seed + i, 10, 60),
    result: results[(seed + i) % results.length]!,
  }))
}

function buildPointsHistory(seed: number, shopName: string, startingBalance: number): PointsHistoryEntry[] {
  let balance = startingBalance
  return Array.from({ length: 5 }).map((_, i) => {
    const type: PointsHistoryEntry['type'] = (seed + i) % 3 === 0 ? 'debit' : 'credit'
    const points = seededNumber(seed + i, 50, 400)
    balance = type === 'credit' ? balance + points : balance - points
    return {
      id: `${shopName}-txn-${i}`,
      transactionId: `TXN-${20260700 + seed * 3 + i}`,
      date: `${((seed + i) % 27) + 1} Jul 2026`,
      type,
      points,
      description: type === 'credit' ? 'Scan reward credited' : 'Redeemed against gift catalogue',
      balanceAfter: Math.max(balance, 0),
    }
  })
}

function buildInterestedProducts(seed: number, shopName: string): InterestedProductEntry[] {
  const statusesList: InterestedProductEntry['status'][] = ['new', 'in_progress', 'closed']
  return Array.from({ length: 3 }).map((_, i) => ({
    id: `${shopName}-interest-${i}`,
    productName: productNames[(seed + i * 2) % productNames.length]!,
    requestedDate: `${((seed + i) % 27) + 1} Jul 2026`,
    handledBy: mrs[(seed + i) % mrs.length]!,
    status: statusesList[(seed + i) % statusesList.length]!,
  }))
}

function buildDocuments(seed: number, shopName: string): LicenseDocument[] {
  const statusesList: LicenseDocument['verificationStatus'][] = ['verified', 'pending', 'rejected']
  const names = ['Drug License', 'GST Certificate', 'Shop Establishment Certificate']
  return names.map((name, i) => ({
    id: `${shopName}-doc-${i}`,
    documentName: name,
    uploadDate: `${((seed + i) % 27) + 1} Jun 2026`,
    verificationStatus: statusesList[(seed + i) % statusesList.length]!,
    expiryDate: `${((seed + i) % 27) + 1} Jun 2028`,
  }))
}

export function generatePartnerBase(index: number, prefix: string, shopSuffix: string): PartnerBase {
  const seed = index + 1
  const shopName = `${['Om', 'Sunrise', 'Care Plus', 'Wellness', 'City', 'Apollo', 'Sri Sai', 'National', 'Metro', 'United'][index % 10]} ${shopSuffix}`
  const availableCoins = seededNumber(seed, 500, 5000)

  return {
    id: `${prefix}-${index + 1}`,
    shopName,
    ownerName: owners[index % owners.length]!,
    email: `${prefix}${index + 1}@medtechpartners.in`,
    phone: `+91 98${(10000000 + index * 137).toString().slice(0, 8)}`,
    city: cities[index % cities.length]!,
    zone: zones[index % zones.length]!,
    status: statuses[index % statuses.length]!,
    licenseNumber: `DL-${2026000 + index * 11}`,
    onboardedBy: index % 3 === 0 ? 'MR' : 'Self',
    availableCoins,
    assignedMr: mrs[index % mrs.length]!,
    geoLock: buildGeoLock(seed),
    registeredAddress: `${seed * 12}, ${shopName} Complex, ${cities[index % cities.length]}, India`,
    totalScans: seededNumber(seed, 200, 2000),
    totalRedemptions: seededNumber(seed * 2, 5, 80),
    scanHistory: buildScanHistory(seed, shopName),
    pointsHistory: buildPointsHistory(seed, shopName, availableCoins),
    interestedProducts: buildInterestedProducts(seed, shopName),
    documents: buildDocuments(seed, shopName),
  }
}
