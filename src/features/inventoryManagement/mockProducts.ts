import type {
  Product,
  ProductAuditEntry,
  ProductMovementEntry,
  ProductRegionConfig,
  ProductStatus,
  ProductTimelineEntry,
} from '@/types/product'
import { mrs } from '@/features/userManagement/mockPartnerData'

const mockRegions: ProductRegionConfig[] = [
  { regionId: 'region-north', regionName: 'North', dealerMultiplier: null, chemistMultiplier: null },
  { regionId: 'region-south', regionName: 'South', dealerMultiplier: null, chemistMultiplier: null },
  { regionId: 'region-east', regionName: 'East', dealerMultiplier: null, chemistMultiplier: null },
  { regionId: 'region-west', regionName: 'West', dealerMultiplier: null, chemistMultiplier: null },
]

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
  Massagers: [
    'Medtech Manipol Massager MPV 1',
    'Medtech Gun Massager GMV1',
    'Medtech Gun Massager GMV4',
  ],
  'Steam Inhalers': ['Medtech HandyVap 01', 'Medtech HandyVap 100'],
  'Digital Thermometers': ['Medtech Handy TMP 02'],
  'Pulse Oximeters': ['Medtech Oxyguard OG05'],
  'Oxygen Concentrators': ['Medtech OXYTEC-SMART'],
}

const catalogEntries = Object.entries(productCatalog).flatMap(
  ([category, names]) => names.map((name) => ({ name, category })),
)
const brands = [
  'MedTech Labs',
  'Apollo Pharma',
  'National Remedies',
  'Sunrise Biotech',
]

/** Real stock photo per product category (Unsplash direct CDN — stable, hotlink-safe URLs), 3 angles each. */
export const categoryImages: Record<string, string[]> = {
  Nebulizers: [
    'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1583912267550-d44c9c3d7e6c?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=600&h=600&q=80',
  ],
  'Blood Pressure Monitors': [
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&h=600&q=80',
  ],
  'Heating Pads': [
    'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=600&h=600&q=80',
  ],
  Massagers: [
    'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1611072965169-e3a3a9c19e5f?auto=format&fit=crop&w=600&h=600&q=80',
  ],
  'Steam Inhalers': [
    'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1583912267550-d44c9c3d7e6c?auto=format&fit=crop&w=600&h=600&q=80',
  ],
  'Digital Thermometers': [
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1583947581924-a640ca246e01?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?auto=format&fit=crop&w=600&h=600&q=80',
  ],
  'Pulse Oximeters': [
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1583912267550-d44c9c3d7e6c?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&h=600&q=80',
  ],
  'Oxygen Concentrators': [
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&h=600&q=80',
    'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&h=600&q=80',
  ],
}
const fallbackProductImages = [
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&h=600&q=80',
  'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=600&h=600&q=80',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&h=600&q=80',
]

function productImagesFor(category: string): string[] {
  return categoryImages[category] ?? fallbackProductImages
}

/** Single representative thumbnail for a category (first angle from its image set). */
export function categoryThumbnailFor(category: string): string {
  return productImagesFor(category)[0]!
}

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

function buildMovementHistory(
  seed: number,
  productId: string,
): ProductMovementEntry[] {
  return Array.from({ length: 3 }).map((_, i) => {
    const quantity = seededNumber(seed + i, 500, 5000)
    const startSerial = 100000 + seed * 7000 + i * 10000
    const endSerial = startSerial + quantity - 1
    const containerStartSerial = startSerial + 500
    const containerEndSerial =
      containerStartSerial + Math.min(quantity, 1000) - 1
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

function buildAuditHistory(
  seed: number,
  productId: string,
): ProductAuditEntry[] {
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

function buildTimeline(
  seed: number,
  productId: string,
  status: ProductStatus,
): ProductTimelineEntry[] {
  const timeline: ProductTimelineEntry[] = [
    {
      id: `${productId}-tl-0`,
      activity: 'Product Created',
      dateTime: dateFromSeed(seed, 'Jun'),
    },
    {
      id: `${productId}-tl-1`,
      activity: 'Reward Points Updated',
      dateTime: dateFromSeed(seed + 3, 'Jun'),
    },
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
  const dealerContainerPoints = seededRoundHundred(seed, 100, 500)
  const dealerProductPoints = seededRoundHundred(seed + 1, 50, 250)
  const chemistContainerPoints = seededRoundHundred(seed + 2, 100, 500)
  const chemistProductPoints = seededRoundHundred(seed + 3, 50, 250)
  const dealerRewardPoints = dealerContainerPoints + dealerProductPoints
  const chemistRewardPoints = chemistContainerPoints + chemistProductPoints

  return {
    id,
    productName: name,
    productCode: `PC-${20260000 + seed * 11}`,
    productCategory: entry.category,
    status,
    uploadedDate: dateFromSeed(seed),

    description: `${name} is a home healthcare device from the ${entry.category} range, designed for reliable everyday use.`,
    productImages: productImagesFor(entry.category),
    sku: `SKU-${100000 + seed * 13}`,
    brand: brands[seed % brands.length]!,
    mrp: seededNumber(seed, 50, 900),
    manufacturingDetails: `Manufactured by ${brands[seed % brands.length]}, batch-tested for quality assurance.`,
    createdDate: dateFromSeed(seed, 'Jun'),
    lastUpdatedDate: dateFromSeed(seed + 3, 'Jun'),

    dealerRewardPoints,
    chemistRewardPoints,
    dealerContainerPoints,
    dealerProductPoints,
    chemistContainerPoints,
    chemistProductPoints,
    regions: mockRegions,
    rewardConfigStatus:
      dealerRewardPoints > 0 && chemistRewardPoints > 0
        ? 'configured'
        : 'pending',

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

export const mockProducts: Product[] = Array.from({ length: 45 }).map(
  (_, index) => buildProduct(index + 1),
)

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id)
}

/** Finds a value in an imported row by trying a list of likely xlsx header spellings, case/space-insensitively. */
function pickField(row: Record<string, string>, keys: string[]): string {
  const normalized = new Map(
    Object.entries(row).map(([header, value]) => [
      header
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, ''),
      value,
    ]),
  )
  for (const key of keys) {
    const value = normalized.get(key)
    if (value) return value
  }
  return ''
}

/** Builds a full Product from one imported xlsx row, mapping common header spellings and filling the rest with defaults. */
export function productFromImportedRow(
  row: Record<string, string>,
  seed: number,
): Product {
  const id = `product-import-${Date.now()}-${seed}`
  const productName =
    pickField(row, ['productname', 'name']) || `Imported Product ${seed}`
  const productCategory =
    pickField(row, ['productcategory', 'category']) ||
    productCategoryOptions[0]!
  const mrpRaw = pickField(row, ['mrp', 'price'])
  const mrp = Number(mrpRaw.replace(/[^0-9.]/g, '')) || 0
  const dealerRewardPoints =
    Number(
      pickField(row, ['dealerrewardPoints', 'dealerPoints']).replace(
        /[^0-9.]/g,
        '',
      ),
    ) || 0
  const chemistRewardPoints =
    Number(
      pickField(row, ['chemistrewardPoints', 'chemistPoints']).replace(
        /[^0-9.]/g,
        '',
      ),
    ) || 0
  const today = dateFromSeed(seed % 27, 'Jul')

  return {
    id,
    productName,
    productCode:
      pickField(row, ['productcode', 'code', 'sku']) ||
      `PC-IMPORT-${Date.now()}${seed}`,
    productCategory,
    status: 'active',
    uploadedDate: today,

    description:
      pickField(row, ['description']) ||
      `${productName} — imported from uploaded file.`,
    productImages: [],
    sku: pickField(row, ['sku']) || `SKU-IMPORT-${Date.now()}${seed}`,
    brand: pickField(row, ['brand']) || brands[0]!,
    mrp,
    manufacturingDetails: pickField(row, ['manufacturingdetails']) || '',
    createdDate: today,
    lastUpdatedDate: today,

    dealerRewardPoints,
    chemistRewardPoints,
    dealerContainerPoints: dealerRewardPoints,
    dealerProductPoints: 0,
    chemistContainerPoints: chemistRewardPoints,
    chemistProductPoints: 0,
    regions: mockRegions,
    rewardConfigStatus:
      dealerRewardPoints > 0 && chemistRewardPoints > 0
        ? 'configured'
        : 'pending',

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
    timeline: [
      { id: `${id}-tl-0`, activity: 'Product Created', dateTime: today },
    ],
  }
}

export const productKpis = {
  totalProducts: mockProducts.length,
  activeProducts: mockProducts.filter((p) => p.status === 'active').length,
  inactiveProducts: mockProducts.filter((p) => p.status === 'inactive').length,
  newProducts: mockProducts.length,
  totalCategories: productCategoryOptions.length,
}
