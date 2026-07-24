import type { Product, ProductAuditEntry, ProductMovementEntry, ProductStatus, ProductTimelineEntry } from '@/types/product'
import { mrs } from '@/features/userManagement/mockPartnerData'

export const productCategoryOptions = [
  'Nebulizers',
  'Blood Pressure Monitors',
  'Heating Pads',
  'Massagers',
  'Steam Inhalers',
  'Digital Thermometers',
  'Pulse Oximeters',
  'Oxygen Concentrators',
]

const productCatalog: Record<string, string[]> = {
  Nebulizers: [
    'Medtech Handyneb Classic',
    'Medtech Handyneb Super',
    'Medtech Handyneb Smart',
    'Medtech Handyneb Gold',
    'Medtech Travelite Nebulizer',
    'Medtech Handyneb Plus',
    'Medtech NEBU-KIT',
  ],
  'Blood Pressure Monitors': [
    'Medtech BP09N Backlight',
    'Medtech BP11',
    'Medtech BP11 Backlight',
    'Medtech BP12',
    'Medtech BP12 Backlight',
    'Medtech BP18',
  ],
  'Heating Pads': ['Medtech HandyPad HP-01', 'Medtech HandyPad HP-11'],
  Massagers: ['Medtech Manipol Massager MPV 1', 'Medtech Gun Massager GMV1', 'Medtech Gun Massager GMV4'],
  'Steam Inhalers': ['Medtech HandyVap 01', 'Medtech HandyVap 100'],
  'Digital Thermometers': ['Medtech Handy TMP 02'],
  'Pulse Oximeters': ['Medtech Oxyguard OG05'],
  'Oxygen Concentrators': ['Medtech OXYTEC-SMART'],
}

const catalogEntries = Object.entries(productCatalog).flatMap(([category, names]) =>
  names.map((name) => ({ name, category })),
)
const brands = ['MedTech Labs', 'Apollo Pharma', 'National Remedies', 'Sunrise Biotech']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function seededRoundHundred(seed: number, min: number, max: number): number {
  const steps = Math.floor((max - min) / 100) + 1
  return min + seededNumber(seed, 0, steps) * 100
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateFromSeed(seed: number, month = 'Jul'): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} 2026`
}

function resolveStatus(seed: number): ProductStatus {
  return (seed * 3 + 1) % 5 === 0 ? 'inactive' : 'active'
}

function buildMovementHistory(seed: number, productId: string): ProductMovementEntry[] {
  return Array.from({ length: 3 }).map((_, i) => {
    const quantity = seededNumber(seed + i, 500, 5000)
    const startSerial = 100000 + seed * 7000 + i * 10000
    const endSerial = startSerial + quantity - 1
    const containerStartSerial = startSerial + 500
    const containerEndSerial = containerStartSerial + Math.min(quantity, 1000) - 1
    return {
      id: `${productId}-movement-${i}`,
      factoryUploadBatch: `BATCH-${2026000 + seed * 3 + i}`,
      quantityUploaded: quantity,
      startSerialNo: `SN-${startSerial}`,
      endSerialNo: `SN-${endSerial}`,
      containerStartSerialNo: `CSN-${containerStartSerial}`,
      containerEndSerialNo: `CSN-${containerEndSerial}`,
      scannedStatus: (seed + i) % 3 === 0 ? 'pending' : 'completed',
    }
  })
}

function buildAuditHistory(seed: number, productId: string): ProductAuditEntry[] {
  const reviewer = mrs[seed % mrs.length]!
  return [
    {
      id: `${productId}-audit-0`,
      date: dateFromSeed(seed, 'Jun'),
      action: 'Product Created',
      performedBy: reviewer,
      previousValue: '—',
      updatedValue: 'Product added to catalogue',
    },
    {
      id: `${productId}-audit-1`,
      date: dateFromSeed(seed + 3, 'Jun'),
      action: 'Reward Points Updated',
      performedBy: reviewer,
      previousValue: `${seededNumber(seed, 10, 30)} pts`,
      updatedValue: `${seededNumber(seed + 5, 30, 60)} pts`,
    },
  ]
}

function buildTimeline(seed: number, productId: string, status: ProductStatus): ProductTimelineEntry[] {
  const timeline: ProductTimelineEntry[] = [
    { id: `${productId}-tl-0`, activity: 'Product Created', dateTime: dateFromSeed(seed, 'Jun') },
    { id: `${productId}-tl-1`, activity: 'Reward Points Updated', dateTime: dateFromSeed(seed + 3, 'Jun') },
  ]
  timeline.push({
    id: `${productId}-tl-2`,
    activity: status === 'active' ? 'Activated' : 'Deactivated',
    dateTime: dateFromSeed(seed + 6),
  })
  return timeline
}

function buildProduct(seed: number): Product {
  const id = `product-${seed}`
  const entry = catalogEntries[seed % catalogEntries.length]!
  const name = entry.name
  const status = resolveStatus(seed)
  const dealerRewardPoints = seededRoundHundred(seed, 100, 500)
  const chemistRewardPoints = seededRoundHundred(seed + 1, 100, 500)

  return {
    id,
    productName: name,
    productCode: `PC-${20260000 + seed * 11}`,
    productCategory: entry.category,
    status,
    uploadedDate: dateFromSeed(seed),

    description: `${name} is a home healthcare device from the ${entry.category} range, designed for reliable everyday use.`,
    productImages: [
      `https://picsum.photos/seed/medtech-product-${seed}-a/600/600`,
      `https://picsum.photos/seed/medtech-product-${seed}-b/600/600`,
      `https://picsum.photos/seed/medtech-product-${seed}-c/600/600`,
    ],
    sku: `SKU-${100000 + seed * 13}`,
    brand: brands[seed % brands.length]!,
    mrp: seededNumber(seed, 50, 900),
    manufacturingDetails: `Manufactured by ${brands[seed % brands.length]}, batch-tested for quality assurance.`,
    createdDate: dateFromSeed(seed, 'Jun'),
    lastUpdatedDate: dateFromSeed(seed + 3, 'Jun'),

    dealerRewardPoints,
    chemistRewardPoints,
    rewardConfigStatus: dealerRewardPoints > 0 && chemistRewardPoints > 0 ? 'configured' : 'pending',

    totalFactoryUploads: seededNumber(seed, 5, 40),
    totalQrCodesGenerated: seededNumber(seed + 1, 1000, 8000),
    totalSuccessfulScans: seededNumber(seed + 2, 500, 6000),
    totalDealerAllocations: seededNumber(seed + 3, 10, 100),
    totalChemistAllocations: seededNumber(seed + 4, 10, 100),
    totalRewardPointsIssued: seededNumber(seed + 5, 5000, 90000),
    totalSecurityAlerts: seededNumber(seed + 6, 0, 15),
    totalShownInterest: seededNumber(seed + 7, 0, 60),

    movementHistory: buildMovementHistory(seed, id),
    auditHistory: buildAuditHistory(seed, id),
    timeline: buildTimeline(seed, id, status),
  }
}

export const mockProducts: Product[] = Array.from({ length: 45 }).map((_, index) => buildProduct(index + 1))

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id)
}

/** Finds a value in an imported row by trying a list of likely xlsx header spellings, case/space-insensitively. */
function pickField(row: Record<string, string>, keys: string[]): string {
  const normalized = new Map(
    Object.entries(row).map(([header, value]) => [header.trim().toLowerCase().replace(/[\s_-]+/g, ''), value]),
  )
  for (const key of keys) {
    const value = normalized.get(key)
    if (value) return value
  }
  return ''
}

/** Builds a full Product from one imported xlsx row, mapping common header spellings and filling the rest with defaults. */
export function productFromImportedRow(row: Record<string, string>, seed: number): Product {
  const id = `product-import-${Date.now()}-${seed}`
  const productName = pickField(row, ['productname', 'name']) || `Imported Product ${seed}`
  const productCategory =
    pickField(row, ['productcategory', 'category']) || productCategoryOptions[0]!
  const mrpRaw = pickField(row, ['mrp', 'price'])
  const mrp = Number(mrpRaw.replace(/[^0-9.]/g, '')) || 0
  const dealerRewardPoints = Number(pickField(row, ['dealerrewardpoints', 'dealerpoints']).replace(/[^0-9.]/g, '')) || 0
  const chemistRewardPoints = Number(pickField(row, ['chemistrewardpoints', 'chemistpoints']).replace(/[^0-9.]/g, '')) || 0
  const today = dateFromSeed(seed % 27, 'Jul')

  return {
    id,
    productName,
    productCode: pickField(row, ['productcode', 'code', 'sku']) || `PC-IMPORT-${Date.now()}${seed}`,
    productCategory,
    status: 'active',
    uploadedDate: today,

    description: pickField(row, ['description']) || `${productName} — imported from uploaded file.`,
    productImages: [],
    sku: pickField(row, ['sku']) || `SKU-IMPORT-${Date.now()}${seed}`,
    brand: pickField(row, ['brand']) || brands[0]!,
    mrp,
    manufacturingDetails: pickField(row, ['manufacturingdetails']) || '',
    createdDate: today,
    lastUpdatedDate: today,

    dealerRewardPoints,
    chemistRewardPoints,
    rewardConfigStatus: dealerRewardPoints > 0 && chemistRewardPoints > 0 ? 'configured' : 'pending',

    totalFactoryUploads: 0,
    totalQrCodesGenerated: 0,
    totalSuccessfulScans: 0,
    totalDealerAllocations: 0,
    totalChemistAllocations: 0,
    totalRewardPointsIssued: 0,
    totalSecurityAlerts: 0,
    totalShownInterest: 0,

    movementHistory: [],
    auditHistory: [
      {
        id: `${id}-audit-0`,
        date: today,
        action: 'Product Created',
        performedBy: 'Import',
        previousValue: '—',
        updatedValue: 'Product added via xlsx import',
      },
    ],
    timeline: [{ id: `${id}-tl-0`, activity: 'Product Created', dateTime: today }],
  }
}

export const productKpis = {
  totalProducts: mockProducts.length,
  activeProducts: mockProducts.filter((p) => p.status === 'active').length,
  inactiveProducts: mockProducts.filter((p) => p.status === 'inactive').length,
  totalRewardPointsIssued: mockProducts.reduce((sum, p) => sum + p.totalRewardPointsIssued, 0),
}
