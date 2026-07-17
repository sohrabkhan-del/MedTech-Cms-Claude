export type ProductCategoryStatus = 'active' | 'inactive'

export interface CategoryProductEntry {
  id: string
  productName: string
  productCode: string
  status: ProductCategoryStatus
}

export interface CategorySchemeEntry {
  id: string
  schemeName: string
  schemeType: string
  status: 'active' | 'upcoming' | 'expired'
  validTill: string
}

export interface ProductCategory {
  id: string
  categoryName: string
  categoryCode: string
  parentCategoryId?: string
  description: string
  status: ProductCategoryStatus
  createdDate: string

  totalProducts: number
  activeSchemesCount: number
  totalRewardPointsIssued: number
  totalScans: number

  products: CategoryProductEntry[]
  activeSchemes: CategorySchemeEntry[]
}
