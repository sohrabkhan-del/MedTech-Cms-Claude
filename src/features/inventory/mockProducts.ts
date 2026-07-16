import type { Product, ProductAuditEntry, ProductMovementEntry, ProductStatus, ProductTimelineEntry } from '@/types/product'
import { mrs } from '@/features/partners/mockPartnerData'

export const productCategoryOptions = ['Cardiac Care', 'Neuro Care', 'Immunity', 'Diabetes Care', 'Pain Relief']

const productNames = ['CardioCare', 'NeuroPlus', 'ImmunoBoost', 'GlucoBalance', 'PainRelief']
const forms = ['10mg', '500mg', 'Syrup', 'Gel', '250mg']
const brands = ['MedTech Labs', 'Apollo Pharma', 'National Remedies', 'Sunrise Biotech']
const dealerNames = ['Rahul Mehta', 'Priya Nair', 'Amit Verma', 'Sunita Rao', 'Vikram Singh']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
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

function buildMovementHistory(seed: number, productId: string, status: ProductStatus): ProductMovementEntry[] {
  return Array.from({ length: 3 }).map((_, i) => ({
    id: `${productId}-movement-${i}`,
    factoryUploadBatch: `BATCH-${2026000 + seed * 3 + i}`,
    containerNumber: `CNT-${100000 + seed * 7 + i}`,
    quantityUploaded: seededNumber(seed + i, 500, 5000),
    assignedDealer: dealerNames[(seed + i) % dealerNames.length]!,
    assignedChemist: dealerNames[(seed + i + 1) % dealerNames.length]!,
    scanCount: seededNumber(seed + i, 50, 800),
    currentStatus: status,
  }))
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
  const name = `${productNames[seed % productNames.length]} ${forms[Math.floor(seed / productNames.length) % forms.length]}`
  const status = resolveStatus(seed)
  const dealerRewardPoints = seededNumber(seed, 10, 40)
  const chemistRewardPoints = seededNumber(seed + 1, 15, 50)

  return {
    id,
    productName: name,
    productCode: `PC-${20260000 + seed * 11}`,
    productCategory: productCategoryOptions[seed % productCategoryOptions.length]!,
    status,
    uploadedDate: dateFromSeed(seed),

    description: `${name} is used for effective treatment and management as recommended by healthcare professionals.`,
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

    movementHistory: buildMovementHistory(seed, id, status),
    auditHistory: buildAuditHistory(seed, id),
    timeline: buildTimeline(seed, id, status),
  }
}

export const mockProducts: Product[] = Array.from({ length: 45 }).map((_, index) => buildProduct(index + 1))

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id)
}

export const productKpis = {
  totalProducts: mockProducts.length,
  activeProducts: mockProducts.filter((p) => p.status === 'active').length,
  inactiveProducts: mockProducts.filter((p) => p.status === 'inactive').length,
  totalRewardPointsIssued: mockProducts.reduce((sum, p) => sum + p.totalRewardPointsIssued, 0),
}
