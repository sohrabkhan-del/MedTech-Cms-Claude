import type { CategoryProductEntry, CategorySchemeEntry, ProductCategory, ProductCategoryStatus } from '@/types/productCategory'
import { mockProducts } from '@/features/inventory/mockProducts'

const categoryDefs: { name: string; parent?: string }[] = [
  { name: 'Nebulizers' },
  { name: 'Blood Pressure Monitors' },
  { name: 'Heating Pads' },
  { name: 'Massagers' },
  { name: 'Steam Inhalers' },
  { name: 'Digital Thermometers' },
  { name: 'Pulse Oximeters' },
  { name: 'Oxygen Concentrators' },
]

const schemeTypes = ['Seasonal Scheme', 'General Scheme', 'Gift Rule Bonus', 'Volume Booster']
const schemeStatuses: CategorySchemeEntry['status'][] = ['active', 'upcoming', 'expired']

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateFromSeed(seed: number, month = 'Jun'): string {
  const day = (seed % 27) + 1
  return `${pad(day)} ${month} 2026`
}

function resolveStatus(seed: number): ProductCategoryStatus {
  return (seed * 5 + 2) % 6 === 0 ? 'inactive' : 'active'
}

function buildSchemes(seed: number, categoryId: string): CategorySchemeEntry[] {
  const count = seededNumber(seed, 1, 4)
  return Array.from({ length: count }).map((_, i) => ({
    id: `${categoryId}-scheme-${i}`,
    schemeName: `${schemeTypes[(seed + i) % schemeTypes.length]} ${2026}`,
    schemeType: schemeTypes[(seed + i) % schemeTypes.length]!,
    status: schemeStatuses[(seed + i) % schemeStatuses.length]!,
    validTill: dateFromSeed(seed + i * 4, 'Dec'),
  }))
}

function buildCategoryProducts(categoryName: string): CategoryProductEntry[] {
  return mockProducts
    .filter((product) => product.productCategory === categoryName)
    .map((product) => ({
      id: product.id,
      productName: product.productName,
      productCode: product.productCode,
      status: product.status,
    }))
}

export const mockProductCategories: ProductCategory[] = categoryDefs.map((def, index) => {
  const seed = index + 1
  const id = `CAT-${1000 + index}`
  const status = resolveStatus(seed)
  const linkedProducts = buildCategoryProducts(def.name)
  const totalRewardPointsIssued = mockProducts
    .filter((p) => p.productCategory === def.name)
    .reduce((sum, p) => sum + p.totalRewardPointsIssued, 0)
  const totalScans = mockProducts
    .filter((p) => p.productCategory === def.name)
    .reduce((sum, p) => sum + p.totalSuccessfulScans, 0)
  const activeSchemes = buildSchemes(seed, id)

  return {
    id,
    categoryName: def.name,
    categoryCode: `CAT-${20260000 + index * 17}`,
    parentCategoryId: undefined,
    description: `${def.name} covers home healthcare devices in the ${def.name.toLowerCase()} range.`,
    status,
    createdDate: dateFromSeed(seed, 'Jan'),

    totalProducts: linkedProducts.length,
    activeSchemesCount: activeSchemes.filter((s) => s.status === 'active').length,
    totalRewardPointsIssued,
    totalScans,

    products: linkedProducts,
    activeSchemes,
  }
}).map((category, index, all) => {
  const parentDef = categoryDefs[index]!.parent
  if (!parentDef) return category
  const parent = all.find((c) => c.categoryName === parentDef)
  return { ...category, parentCategoryId: parent?.id }
})

export function getProductCategoryById(id: string): ProductCategory | undefined {
  return mockProductCategories.find((category) => category.id === id)
}

export function getParentCategoryName(parentCategoryId?: string): string | undefined {
  if (!parentCategoryId) return undefined
  return mockProductCategories.find((c) => c.id === parentCategoryId)?.categoryName
}

export const topLevelCategoryOptions = mockProductCategories.filter((c) => !c.parentCategoryId)

export const productCategoryKpis = {
  totalCategories: mockProductCategories.length,
  activeCategories: mockProductCategories.filter((c) => c.status === 'active').length,
  inactiveCategories: mockProductCategories.filter((c) => c.status === 'inactive').length,
  totalProductsMapped: mockProductCategories.reduce((sum, c) => sum + c.totalProducts, 0),
}
