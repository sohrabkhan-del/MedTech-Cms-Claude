import type { ShowcaseProduct } from '@/types/showcaseProduct'

export const showcaseCategoryOptions = ['Medicines', 'Cardiac Care', 'Neuro Care', 'Immunity', 'Diabetes Care', 'Pain Relief']
const brands = ['MediCure Labs', 'Cipla', 'Sun Pharma', 'Dr. Reddy\'s', 'Zydus']
const productNames = ['Ibuprofen 400mg Tablets', 'Paracetamol 500mg Tablets', 'Amoxicillin 250mg Capsules', 'Vitamin D3 Sachets', 'Antacid Chewable Tablets']

/** Real stock photo per showcase category (Unsplash direct CDN — stable, hotlink-safe URLs). */
const showcaseCategoryImages: Record<string, string> = {
  Medicines: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&h=600&q=80',
  'Cardiac Care': 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?auto=format&fit=crop&w=600&h=600&q=80',
  'Neuro Care': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&h=600&q=80',
  Immunity: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&h=600&q=80',
  'Diabetes Care': 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=600&h=600&q=80',
  'Pain Relief': 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=600&h=600&q=80',
}

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function buildShowcaseProduct(seed: number): ShowcaseProduct {
  const id = `showcase-${seed}`
  const name = productNames[seed % productNames.length]!
  const categoryName = showcaseCategoryOptions[seed % showcaseCategoryOptions.length]!
  const mrp = seededNumber(seed, 199, 2499)
  const dealerPrice = Math.round(mrp * 0.8)
  const chemistPrice = Math.round(mrp * 0.88)

  return {
    id,
    productCode: `PRD${1000 + seed}`,
    name,
    description: `${name} is a promotional showcase item highlighted to Dealers and Chemists as part of ongoing marketing campaigns.`,
    categoryId: categoryName,
    category: { id: categoryName, code: categoryName.toUpperCase().replace(/\s+/g, '_'), name: categoryName },
    brand: brands[seed % brands.length]!,
    images: [{ url: showcaseCategoryImages[categoryName]!, isPrimary: true }],
    mrp,
    dealerPrice,
    chemistPrice,
    availableStock: seededNumber(seed, 20, 500),
    stockUnit: 'boxes',
    lowStockThreshold: 50,
    isActive: seed % 7 !== 0,
    visibleTo: seed % 3 === 0 ? ['dealer'] : seed % 3 === 1 ? ['chemist'] : ['dealer', 'chemist'],
    createdAt: new Date(2026, 6, (seed % 27) + 1).toISOString(),
    updatedAt: new Date(2026, 6, (seed % 27) + 1).toISOString(),
  }
}

export const mockShowcaseProducts: ShowcaseProduct[] = Array.from({ length: 24 }).map((_, index) => buildShowcaseProduct(index + 1))

export function getShowcaseProductById(id: string): ShowcaseProduct | undefined {
  return mockShowcaseProducts.find((product) => product.id === id)
}

export const showcaseProductKpis = {
  totalProducts: mockShowcaseProducts.length,
  activeProducts: mockShowcaseProducts.filter((p) => p.isActive).length,
  productsEnquiredFor: 0,
  totalPendingEnquiries: 0,
}
